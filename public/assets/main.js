$("#submit").click(function (){
    //MAKE HTTP REQUEST
    var original_url = $('#url').val();
    const Http = new XMLHttpRequest();
    var url='http://localhost:3000/generate';
    //var url = 'https://aba2e87f-5257-4dd7-9e2e-ccb65c9da686.mock.pstmn.io'
    var value = {"url":original_url};
    Http.open("POST", url,true);
    Http.setRequestHeader('Content-Type', 'application/json');
    Http.send(JSON.stringify(value));
    var jsonobj;
    Http.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
           jsonobj = JSON.parse(Http.responseText);
           displayURL(jsonobj)
        }
        else{
            console.log(this.status);
        }
    
    };
    
    }
)

function displayURL(jsonobject){
    console.log(jsonobject);
    var shorturl = jsonobject["hash"];
    $('#short_url').val(shorturl)
    console.log(shorturl);
    $('.display').css("display","block");

}