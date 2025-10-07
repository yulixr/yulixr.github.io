#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
pw_journey_tools.py

Функции:
  A) Вытянуть ВСЕ Journey и сохранить CSV: journeys.csv
  B) По конкретному JOURNEY_ID вытащить points-статистику и сохранить CSV: journey_<id>_points.csv
  C) По campaign_code (из points) вытащить клики (с e-mail / hwid) и сохранить CSV: clicks_<campaign>.csv

Зависимости: requests
Переменные окружения:
  PW_TOKEN = API Access Token из Pushwoosh Control Panel (используется как Authorization: Api <token>)

Примеры:
  # A) выгрузить все journeys:
  python3 pw_journey_tools.py --export-journeys

  # B) выгрузить points по конкретной journey:
  python3 pw_journey_tools.py --journey-id aaaa-bbbb-cccc-dddd-eeee --export-points

  # C) выгрузить клики по конкретному campaign_code за последние дни (ВАЖНО: у этого эндпоинта часто требуется link_template)
  python3 pw_journey_tools.py --clicks-campaign F375C-00B7C --date-from 2025-10-01 --date-to 2025-10-06 \
      --link-template "https://sabiotrade.com/*"
"""

import os
import sys
import csv
import time
import argparse
from typing import Dict, Any, List, Optional

import requests

# ----- Константы API -----
JOURNEY_API_BASE = "https://journey.pushwoosh.com/api"
V2_API_BASE = "https://api.pushwoosh.com/api/v2"

# ----- Утилиты -----
def auth_headers_api() -> Dict[str, str]:
    token = os.environ.get("PW_TOKEN")
    if not token:
        print("Ошибка: переменная окружения PW_TOKEN не задана.", file=sys.stderr)
        sys.exit(2)
    return {
        "Authorization": f"Api {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "pw-journey-tools/1.0",
    }

def get_json(url: str, headers: Dict[str, str], params: Optional[Dict[str, Any]] = None, retry: int = 3) -> Dict[str, Any]:
    last_exc = None
    for i in range(retry):
        try:
            r = requests.get(url, headers=headers, params=params, timeout=60)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            last_exc = e
            time.sleep(1.5 ** i)
    raise RuntimeError(f"GET failed: {url} :: {last_exc}")

def post_json(url: str, headers: Dict[str, str], body: Dict[str, Any], retry: int = 3) -> Dict[str, Any]:
    last_exc = None
    for i in range(retry):
        try:
            r = requests.post(url, headers=headers, json=body, timeout=120)
            # полезно видеть 4xx-тело
            if r.status_code in (400, 401, 403):
                raise RuntimeError(f"HTTP {r.status_code} {url}\nrequest={body}\nresponse={r.text}")
            r.raise_for_status()
            return r.json()
        except Exception as e:
            last_exc = e
            time.sleep(1.5 ** i)
    raise RuntimeError(f"POST failed: {url} :: {last_exc}")

# ----- A) выгрузка всех Journey -----
def export_all_journeys(outfile: str = "journeys.csv") -> None:
    headers = auth_headers_api()
    page = 1
    rows: List[List[str]] = []
    print("[journeys] начинаю постраничную выгрузку…")
    while True:
        url = f"{JOURNEY_API_BASE}/journey"
        data = get_json(url, headers, params={"page": page})
        meta = data.get("_metadata", {})
        items = (data.get("payload") or {}).get("items") or []
        print(f"[journeys] page={meta.get('page')} items={len(items)} / pages={meta.get('page_count')} total={meta.get('total_count')}")
        for it in items:
            jid = it.get("id") or ""
            title = it.get("title") or ""
            status = it.get("status") or ""
            created_at = it.get("createdAt") or ""
            rows.append([jid, title, status, created_at])
        if page >= (meta.get("page_count") or 1):
            break
        page += 1

    with open(outfile, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["journey_id", "title", "status", "createdAt"])
        w.writerows(rows)
    print(f"[journeys] ok: сохранено {len(rows)} строк в {outfile}")

# ----- B) points статистика по одной Journey -----
def export_journey_points(journey_id: str, outfile: Optional[str] = None) -> str:
    headers = auth_headers_api()
    url = f"{JOURNEY_API_BASE}/journey/{journey_id}/statistics/external"
    data = get_json(url, headers)
    payload = data.get("payload") or {}
    journey_title = payload.get("title") or ""
    points = payload.get("points") or []

    rows: List[List[Any]] = []
    for p in points:
        point_title = p.get("pointTitle") or ""
        campaign_code = p.get("campaignCode") or ""
        stat = p.get("pointStat") or {}
        sent = int(stat.get("sent") or 0)
        opened = int(stat.get("opened") or 0)
        clicked = int(stat.get("clicked") or 0)
        unsub = int(stat.get("unsubscribed") or 0)
        soft = int(stat.get("softBounces") or 0)
        comp = int(stat.get("complaints") or 0)
        soft_plus_complaints = soft + comp
        rows.append([point_title, journey_title, campaign_code, sent, opened, clicked, unsub, soft_plus_complaints])

    if outfile is None:
        outfile = f"journey_{journey_id}_points.csv"

    with open(outfile, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["pointTitle", "journeyTitle", "campaignCode", "sent", "opened", "clicked", "unsubscribed", "softBouncesPlusComplaints"])
        w.writerows(rows)

    print(f"[points] ok: journey_id={journey_id} title='{journey_title}'; сохранено {len(rows)} строк в {outfile}")
    return outfile

# ----- C) клики по campaign_code через linksInteractionsDevices -----
def export_clicks_by_campaign(campaign_code: str,
                              date_from: str,
                              date_to: str,
                              link_template: str,
                              outfile: Optional[str] = None) -> str:
    """
    ВАЖНО: для большинства аккаунтов при использовании фильтра campaign/application
           эндпоинт ОБЯЗАТЕЛЬНО требует link_template (паттерн ссылок).
           Дата — строго в пределах последних ~30 дней.

    Пишем CSV: timestamp, link, hwid
    """
    headers = auth_headers_api()
    url = f"{V2_API_BASE}/statistics/emails/linksInteractionsDevices"

    page = 0
    per_page = 1000
    total_items = 0
    rows: List[List[str]] = []

    print(f"[clicks] campaign={campaign_code}; range={date_from}..{date_to}; link_template='{link_template}'")
    while True:
        body = {
            "filters": {
                "campaign": campaign_code,
                "link_template": link_template,
                "date_range": {"date_from": date_from, "date_to": date_to}
            },
            "per_page": per_page,
            "page": page
        }
        data = post_json(url, headers, body)
        items = data.get("items") or []
        if page == 0 and not items and data.get("error"):
            # полезная диагностика, если сервер вернул ошибку
            raise RuntimeError(f"[clicks] API error: {data.get('error')}")
        for it in items:
            ts = it.get("timestamp") or ""
            link = it.get("link") or ""
            hwid = it.get("hwid") or ""  # для email — это сам email
            rows.append([ts, link, hwid])
        total_items += len(items)
        print(f"[clicks] page={page} items={len(items)} (accum={total_items})")
        if len(items) < per_page:
            break
        page += 1

    if outfile is None:
        outfile = f"clicks_{campaign_code}.csv"

    with open(outfile, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["timestamp", "link", "hwid"])
        w.writerows(rows)

    print(f"[clicks] ok: сохранено {len(rows)} строк в {outfile}")
    return outfile

# ----- CLI -----
def main():
    ap = argparse.ArgumentParser(description="Pushwoosh Journey exporter")
    ap.add_argument("--export-journeys", action="store_true", help="Выгрузить все journeys в journeys.csv")
    ap.add_argument("--journey-id", help="UUID конкретной journey")
    ap.add_argument("--export-points", action="store_true", help="По --journey-id выгрузить points-статистику в CSV")
    ap.add_argument("--clicks-campaign", help="Campaign code для выгрузки персональных кликов")
    ap.add_argument("--date-from", help="YYYY-MM-DD (например 2025-10-01)")
    ap.add_argument("--date-to", help="YYYY-MM-DD (например 2025-10-06)")
    ap.add_argument("--link-template", help="Паттерн ссылок, напр. 'https://sabiotrade.com/*' (обязателен для campaign/application)")
    args = ap.parse_args()

    # A) все journeys
    if args.export_journeys:
        export_all_journeys("journeys.csv")

    # B) points по одной journey
    if args.export_points:
        if not args.journey_id:
            print("Ошибка: для --export-points нужен --journey-id", file=sys.stderr)
            sys.exit(2)
        export_journey_points(args.journey_id)

    # C) клики по campaign_code
    if args.clicks_campaign:
        if not args.date_from or not args.date_to:
            print("Ошибка: для выгрузки кликов нужны --date-from и --date-to (YYYY-MM-DD), окно ≤ 30 дней", file=sys.stderr)
            sys.exit(2)
        if not args.link_template:
            print("Ошибка: для фильтра по campaign необходим --link-template (например 'https://sabiotrade.com/*')", file=sys.stderr)
            sys.exit(2)
        export_clicks_by_campaign(
            campaign_code=args.clicks_campaign,
            date_from=args.date_from,
            date_to=args.date_to,
            link_template=args.link_template
        )

    if not any([args.export_journeys, args.export_points, args.clicks_campaign]):
        print("Нечего делать. Примеры использования см. в начале файла или запусти с -h", file=sys.stderr)

if __name__ == "__main__":
    main()
