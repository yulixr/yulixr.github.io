$(document).ready(function(){
// массивы для  выпадающих списков
	options = get_options();
	
	populate_select($('#source'), options.source);
	populate_select($('#medium'), options.medium);
	populate_select($('#product'), options.product);
	
	$('button#generate').click(function(){
		generate_code();
	})


	function populate_select(target, data){

		let select = target;
		select.append('<option value="">not selected</option>')		

		for(i=0; i < data.length; i++){
			select.append('<option value="'+ data[i].value +'">'+ data[i].label + '</option>')
			}
	}

	function insert_utm(url, tag, value){

		if(tag.length && value.length){
			console.log('inserting code');
			return url + get_concatenator(url) + tag + '=' + value;
		}

		else{
			console.log('no code to insert');
			console.log(tag + ' / ' + value);
			return url;
		}

	}

	function get_concatenator(url){
		if (url.indexOf("?") < 0 ){
			return "?";
		}

		else{
			return "&";
		}
	}

	$('input,select').click(function(){
		console.log('change is coming!')
		$('div#generated').fadeOut();
		$('div#error').fadeOut();
		$('div#copytext').fadeOut();
		$('div#succes_copy').html("");
	})

	function check_paid(campaign){
		if (!campaign.includes("paid"))
		{
			$('div#errormsg').html("💩 добавьте paid в конец названия компании!!! 💩");
			$('div#error').fadeIn();
			console.log("miss paid")
		}
	}
	function check_date(campaign){
		if (campaign.search(/\d/) == -1)
		{
			$('div#errormsg').html("💩 добавьте дату в название компании!!! 💩");
			$('div#error').fadeIn();
			console.log("miss date");
			return 0;
		}
		else
			return 1;
	}

	function smm_generator(url, medium, link_text){
		url1 = url;
		url = insert_utm(url, 'utm_medium', medium);
		url = insert_utm(url, 'utm_source', 'vk.com' );
		url += get_concatenator(url) + 'utm_campaign' + '=' + link_text +'\n</br>';
		url += url1;
		url = url +  '?' + 'utm_medium=' + medium;
		url = insert_utm(url, 'utm_source', 'telegram' );
		url += get_concatenator(url) + 'utm_campaign' + '=' + link_text +'\n</br>';
		url += url1;
		url = url +  '?' + 'utm_medium=' + medium;
		url = insert_utm(url, 'utm_source', 'facebook.com' );
		url += get_concatenator(url) + 'utm_campaign' + '=' + link_text +'\n</br>';
		url += url1 ;
		url = url +  '?' + 'utm_medium=' + medium;
		url = insert_utm(url, 'utm_source', 'instagram' );
		url += get_concatenator(url) + 'utm_campaign' + '=' + link_text +'\n</br>';
		url += url1;
		url = url +  '?' + 'utm_medium=' + medium;
		url = insert_utm(url, 'utm_source', 'ok.ru' );
		url += get_concatenator(url) + 'utm_campaign' + '=' + link_text +'\n</br>';
		return url;
	}
	function check_slash(){
		if ($('input#url').val().endsWith("/"))
			return $('input#url').val();
		else
			return $('input#url').val() + '/';
		}

	function generate_code(){
		let url = check_slash();
		let link_text ="";
		if ($('select#product').val() != ""){
			check_date($('input#term').val());
			link_text = $('select#product').val() + "_" + $('input#term').val();
		}
		else
			link_text = $('input#term').val();

		let source = $('select#source').val();
		let medium = $('select#medium').val();
		let medium1 = $('input#medium1').val();
		let source1 = $('input#source1').val();
		
		if (medium == "social")
		{
			if(check_date(link_text))
				url = smm_generator(url, medium, link_text);
		}
		else{

		if ((source == "youtube.com" && medium == "referral")|| (source == "telegram" && medium == "referral")
			||(source == "habr.com" && medium == "banner"))
			check_paid(link_text);


		if (source == "" && source1 != "")
			url = url + get_concatenator(url) + 'utm_source=' + source1;
		else if (source1 == "")
			url = insert_utm(url, 'utm_source', source );
		else
			console.log("no source");
		if (source == "blog")
		{
			url = url + get_concatenator(url) + 'utm_medium=' + "innerreferral";
			$('select#medium').val('innerreferral');
			$('input#medium1').val('innerreferral');
		}
		else {
			if (medium == "" && medium1 != "")
				url = url + get_concatenator(url) + 'utm_medium=' + medium1;
			else if (medium1 == "")
				url = insert_utm(url, 'utm_medium', medium );
			else
				console.log("no medium");
		}
		
		if (link_text == "")
			console.log("no campaign");
		else {
			check_date(link_text);
			url = url + get_concatenator(url) + 'utm_campaign' + '=' + link_text;
		}
	}
		if ($('input#url').val() != ""){
			$('div#code').html(url);
			$('div#generated').fadeIn();
			$('button#copytext').fadeIn();
			$('button#copytext').click(function(){
				copy_text();
				$('div#succes_copy').html("✅");
			});
		}
	}
	function copy_text() {
    	var $tmp = $("<textarea>");
    	$("body").append($tmp);
    	$tmp.val($("div#code").text()).select();
    	document.execCommand("copy");
    	$tmp.remove();
	}    
function get_options(){
	let options =  {
		product: [
				{value: "dedicated", label: "dedicated"},
				{value: "cloud", label: "cloud"},
				{value: "uzbekistan", label: "uzbekistan"},
				{value: "nl1", label: "nl1"},
				{value: "cloud", label: "cloud"},
				{value: "storage", label: "storage"},
				{value: "cdn", label: "cdn"},
				{value: "dbaas", label: "dbaas"},
				{value: "kubernetes", label: "kubernetes"},
				{value: "craas", label: "craas"},
				{value: "managed_services", label: "managed_services"},
			        {value: "ml", label: "ml"},
				{value: "file_storage", label: "file_storage"},
				{value: "vmware", label: "vmware"},
				{value: "draas", label: "draas"},
				{value: "baas", label: "baas"},
				{value: "security", label: "security"},
				{value: "1c", label: "1c"},
				{value: "lbaas", label: "lbaas"},
				{value: "subscribe", label: "subscribe"}
		],
		source:  [
				{value: "vk.com", label: "vk.com"},
				{value: "facebook.com", label: "facebook.com"},
				{value: "instagram", label: "instagram"},
				{value: "youtube.com", label: "youtube.com"},
				{value: "telegram", label: "telegram"},
				{value: "blog", label: "blog"},
				{value: "vc.ru", label: "vc.ru"},
				{value: "habr.com", label: "habr.com"},
				{value: "yandex", label: "yandex"},
				{value: "mytarget", label: "mytarget"},
				{value: "linkedin", label: "linkedin"},
				{value: "mindbox", label: "mindbox"},
				{value: "ok.ru", label: "ok.ru"}				
			  ],
		medium: [
					{value:"email", label:"email"}, 
					{value:"content", label:"content"}, 
					{value:"social", label:"social"},
					{value:"referral", label:"referral"}, 
					{value:"innerreferral", label:"innerreferral"}, 
					{value:"banner", label:"banner"},
					{value:"cpc", label:"cpc"},
					{value:"display", label:"display"},
					{value:"sproject", label:"sproject"},
					{value:"pr", label:"pr"}, 
				],

	}
	return options
}
})
