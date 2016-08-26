$(document).ready(function(){
$('.collapsible').collapsible({
  accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
   });
$("#compresult").hide();
$("#loader_title2").hide();
$("#addCompany").click(function(e){
    formContent=`<div class="input-field col s3">
        <input class="input_choice" type="text">
        <label class="red-text" for="cmpname2">Company Name</label>
       </div>`;
    $("#compForm").append(formContent);
});
$("#remCompany").click(function(e){
  // console.log('Clicked');
  clearCompTbl();
});
$("#resetcompany").click(function(e){
  // console.log('clicket');
    $("#compForm .input_choice").each(function(){
      this.value="";
    });
    clearCompTbl();
});
function clearCompTbl(){
  $("#compForm").remove();
  formContent=
  `<div id="compForm" class="row">
      <div class="input-field col s3">
        <input class="input_choice" type="text">
        <label class="red-text" for="cmpname1">Company Name</label>
      </div>
       <div class="input-field col s3">
        <input class="input_choice" type="text">
        <label class="red-text" for="cmpname2">Company Name</label>
       </div>
  </div>`
  $("#compForm1").append(formContent);
}
$("#submit").click(function(e){
  postdata=[];
  $("#compForm .input_choice").each(function(){
    this.value==""?"":postdata.push({"compname":this.value});
  });

  console.log(JSON.stringify(postdata));
  e.preventDefault();
  $("#loader_title2").show();
  $("#compresult tbody").remove();
  $("#compresult").hide();
  var tblcnt='<tbody>';
  $.ajax({type: "POST",
          url: "/getcompreport",
          data: {data:postdata},
          // contentType: "application/json;",
          contentType: "application/x-www-form-urlencoded",
          dataType: "json",
          success:function(result){
            console.log('In Success');
            console.log(JSON.stringify(result));
            for(i=0;i<result.length;i++){
              tblcnt += '<tr><td>' + result[i].companyname + '</td><td>' + result[i].totalrepos + '</td></tr>'
            }
            tblcnt += '</tbody>';
            $("#compresult").append(tblcnt);
            $("#compresult").show();
            $("#loader_title2").hide();
          },
          error:function(data){
            console.log(JSON.stringify(data));
          }
  });

});
});