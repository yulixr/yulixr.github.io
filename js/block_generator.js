$(document).ready(function(){
    // массивы для  выпадающих списков
        options = get_options();
        
        // select lists from the lists below
        
        // Обработчик изменения состояния чекбоксов
        $('#articles, #products').on('change', function() {
            // Очищаем выпадающий список
            $('#product').empty();

            // Проверяем состояние чекбоксов и заполняем список соответствующими данными
            if ($('#products').is(':checked') && $('#articles').is(':checked')) 
            {
                populate_select($('#product'), options.product);
            }
            else if ($('#articles').is(':checked')) {
                populate_select($('#product'), options.article);
            } else if ($('#products').is(':checked')) {
                populate_select($('#product'), options.product);
            }
            else if ($('#products').is(':checked') == false && $('#articles').is(':checked') == false) $('#product').empty();
        });

        $('button#generate').click(function(){
            generate_code();
        })
    
        function populate_select(target, data){
            let select = target;
            for(i=0; i < data.length; i++){
                select.append('<option value="'+ data[i].value +'">'+ data[i].label + '</option>')
                }
        }
        

        // For showing checkboxes in the multiple list
       
        // construct utm
        $('input,select').click(function(){
            console.log('change is coming!')
            $('div#generated').fadeOut();
            $('div#error').fadeOut();
            $('div#copytext').fadeOut();
            $('div#succes_copy').html("");
        })
        
        function base_prod_block(otstyp,color){
            return blocks.else + blocks.start.replace("REP", otstyp) + blocks.DBaaS.split("#0e0d0d").join(color)+ blocks.probel + blocks.DBaaS.split("#0e0d0d").join(color) + blocks.probel + blocks.DBaaS.split("#0e0d0d").join(color)+ blocks.end;
        }
        function base_article_block(otstyp,color){
            return blocks.else + blocks.start.replace("REP", otstyp) + blocks.Articles_DBaaS.split("#0e0d0d").join(color)+ blocks.probel + blocks.Articles_DBaaS.split("#0e0d0d").join(color) + blocks.probel + blocks.Articles_DBaaS.split("#0e0d0d").join(color)+ blocks.end;
        }

        function get_code(base, spisok, options, color, otstyp){
            if (base == "article") {seg = "Articles"; match = options.articles;match1=""}
            else if (base == "product") {seg = "Products"; match = options.products;match1=""}
            else { seg="Articles"; match = options.products; match1 = options.articles}
            code = ""
            i = 0;
            len = spisok.len;
            spisok.forEach(function(item, i) {
                if (i == 0) code = blocks.ifcondition.replace("place", seg+item);
                else if (i != 0 && i != len) code += blocks.elseifcondition.replace("place", seg+item);
                code += blocks.start.replace("REP", otstyp);
                if (match1){
                    let matchingSource = match.find(sourceItem => sourceItem.label === item);
                    let matchingSource1 = match1.find(sourceItem => sourceItem.label === item);
                    stat = matchingSource1.value[Math.floor(Math.random() * 2)];
                    console.log(stat)
                    k = 0;
                    if (matchingSource && stat) {
                        matchingSource.value.forEach(value => {
                            if (k == 1) {console.log("ffff" + k);
                                code += blocks[stat].split("#0e0d0d").join(color);code += blocks.probel;}
                            else {
                                console.log("fsafsdaf" + k + " " + value);    
                                code += blocks[value].split("#0e0d0d").join(color);
                                if (k!= 2) code += blocks.probel;
                            }
                            k+=1;
                        });
                    }
                }
                else {    
                    let matchingSource = match.find(sourceItem => sourceItem.label === item);
                    k = 0;
                    if (matchingSource) {
                        matchingSource.value.forEach(value => {
                            code += blocks[value].split("#0e0d0d").join(color);
                            if (k!=2) code += blocks.probel;
                            k+=1;
                        });
                    }
                }
                code += blocks.end;
                i++;
            });
            if (base == "product") code += base_prod_block(otstyp,color);
            else code += base_article_block(otstyp,color);
            return code;
        }
        
        function generate_code(){
            let url = "";
            let link_text ="";
            
            let color = $('#color-picker').val();
            let otstyp = $('#otstyp').val();
            let article = $('#articles').is(':checked');
            let product = $('#products').is(':checked');
            
            var spisok = $('select#product').val();
            console.log(spisok)
            if (spisok != null){
                if (product && !article){
                    link_text = get_code("product", spisok, options, color, otstyp);
                }
                else if(article && !product)
                {
                    link_text = get_code("article", spisok, options, color, otstyp);
                }
                else if(article && product){
                    link_text = get_code("2", spisok, options, color, otstyp);
                }
            }
            else
              link_text = ""

            url = link_text;
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
            $tmp.val($("#code").html()).select();
            document.execCommand("copy");
            $tmp.remove();
        }  

    function get_options(){
        let options =  {
            product: [
                    {value: "DBaaS", label: "DBaaS"},
                    {value: "Storage", label: "Storage"},   
                    {value: "Cloud", label: "Cloud"},  
                    {value: "Dedicated", label: "Dedicated"},
            ],
            article: [
                {value: "Dedicated", label: "Dedicated"},
                {value: "DBaaS", label: "DBaaS"},
                {value: "Cloud", label: "Cloud"},
                {value: "Storage", label: "Storage"},
                {value: "Network", label: "Network"},
                {value: "CDN", label: "CDN"},
                {value: "Colocation", label: "Colocation"},                    
            ],
            products:  [
                {value: ["DBaaS", "DBaaS", "DBaaS"], label: "Dedicated"},
                {value: ["DBaaS", "DBaaS", "DBaaS"], label: "DBaaS"},
                {value: ["DBaaS", "DBaaS", "DBaaS"], label: "Cloud"},
                {value: ["DBaaS", "DBaaS", "DBaaS"], label: "Storage"},   
                ],
            articles:  [
                {value: ["Articles_DBaaS", "Articles_DBaaS", "Articles_DBaaS"], label: "Dedicated"},
                {value: ["Articles_DBaaS", "Articles_DBaaS", "Articles_DBaaS"], label: "DBaaS"},
                {value: ["Articles_DBaaS", "Articles_DBaaS", "Articles_DBaaS"], label: "Cloud"},
                {value: ["Articles_DBaaS", "Articles_DBaaS", "Articles_DBaaS"], label: "Storage"},
                {value: ["Articles_DBaaS", "Articles_DBaaS", "Articles_DBaaS"], label: "Network"},
                {value: ["Articles_DBaaS", "Articles_DBaaS", "Articles_DBaaS"], label: "CDN"},
                {value: ["Articles_DBaaS", "Articles_DBaaS", "Articles_DBaaS"], label: "Colocation"},    
                ],
        }
        return options
    }
    })
    
