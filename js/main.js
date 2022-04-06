$(document).ready(function(){
// массивы для  выпадающих списков
	options = get_options();
	
	populate_select($('#source'), options.source);
	populate_select($('#medium'), options.medium);
	
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
	})

	function check_paid(campaign){
		if (!campaign.includes("paid"))
		{
			$('div#errormsg').html("💩 добавьте paid в конец названия компании!!! 💩");
			$('div#error').fadeIn();
			console.log("miss paid")
		}

	}
	function generate_code(){
		let url = $('select#protocol').val() + $('input#url').val() + '/';
		let link_text = $('input#term').val();

		let source = $('select#source').val();
		let medium = $('select#medium').val();
		let medium1 = $('input#medium1').val();
		let source1 = $('input#source1').val();
		
		if (source == "youtube.com" || source == "telegram")
			check_paid(link_text);

		if (source == "" && source1 != "")
			url = url + get_concatenator(url) + 'utm_source=' + source1;
		else if (source1 == "")
			url = insert_utm(url, 'utm_source', source );
		else
			console.log("no source");

		if (medium == "" && medium1 != "")
			url = url + get_concatenator(url) + 'utm_medium=' + medium1;
		else if (medium1 == "")
			url = insert_utm(url, 'utm_medium', medium );
		else
			console.log("no medium");
		
		if (link_text == "")
			console.log("no campaign");
		else
			url = url + get_concatenator(url) + 'utm_campaign' + '=' + link_text;
		if ($('input#url').val() != ""){
		$('div#code').html(url)
		$('div#generated').fadeIn();}
	}

function get_options(){
	let options =  {
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
