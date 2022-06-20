$(document).ready(function(){
    // массивы для  выпадающих списков
        options = get_options();
        
        // select lists from the lists below
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
    

        // For showing checkboxes in the multiple list
       
        // construct utm
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
    
        function check_slash(){
            if ($('input#url').val().endsWith("/"))
                return $('input#url').val();
            else
                return $('input#url').val() + '/';
        }
        
    
        function generate_code(){
            let url = check_slash();
            let link_text ="";
            
            let source = $('select#source').val();
            let source1 = $('input#source1').val();
            console.log(source1)
            if (source1 != "")
			    url = url + get_concatenator(url) + 'utm_campaign=' + source1;
		    else if (source1 == "")
			    url = insert_utm(url, 'utm_campaign', source );


            var spisok = $('select#product').val();

            if ($('select#product').val() != ""){
                spisok.forEach(function(item, i) {
                    link_text += item + "_";
                  });
                check_date($('input#term').val());
                link_text = link_text.slice(0, -1);
                link_text += '/' + $('input#term').val();
            }
            else
                link_text = $('input#term').val();
            
            if (link_text == "")
                console.log("no campaign");
            else {
                url = url + "/" + link_text;
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
                    {value: "1c", label: "1C"},
                    {value: "ddos", label: "Anti-DDoS"},
                    {value: "dedicated", label: "Chipcore"},
                    {value: "cloudreselling", label: "Cloud Reselling"},
                    {value: "cloudservers", label: "Cloud Servers"},
                    {value: "cloudstorage", label: "Cloud Storage"},
                    {value: "colocation", label: "Colocation"},
                    {value: "dedicated", label: "Custom_D"},
                    {value: "dedicated", label: "Dedicated"},
                    {value: "googleworkspace", label: "Google Workspace"},
                    {value: "hyperserver", label: "HyperServer"},
                    {value: "lbaas", label: "LBaaS"},
                    {value: "dbaas", label: "Managed Databases (DBaaS)"},
                    {value: "kubernetes", label: "Managed Kubernetes"},
                    {value: "managedservices", label: "Managed Services"},
                    {value: "network", label: "network services"},
                    {value: "dedicated", label: "New Chipcore"},
                    {value: "opticallinks", label: "optical_links"},
                    {value: "RACKS", label: "racks"},
                    {value: "securityservices", label: "Security Services"},
                    {value: "serverless", label: "Serverless"},
                    {value: "sfs", label: "SFS"},
                    {value: "veem", label: "Veeam cloud connect"},
                    {value: "videoanalytics", label: "VideoAnalytics"},
                    {value: "vmware", label: "VMWARE"},
                    {value: "vscale", label: "VSCALE"},
                    {value: "rackrental", label: "аренда стойки"},
                    {value: "vols", label: "ВОЛС"},
                    {value: "archive", label: "Архивные услуги"},
                    {value: "monitoring", label: "мониторинг"},
                    {value: "backups", label: "Резервное копирование"},
                    {value: "uzbekistan", label: "Узбекистан"},
                    {value: "amsterdam", label: "Амстердам"}
                    
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
    
