function getStates() {
    var htmldata = '';
    var count = 1;
    var color = '';
    var state = '';
    $.ajax({
        type: "GET",
        url: "/getStateCounts",
        // contentType: "application/json;",
        contentType: "application/x-www-form-urlencoded",
        dataType: "json",
        success: function(result) {
            var dataUpdated = '';
            console.log('In Success');

            result.forEach(function(statename) {
                // console.log(statename["Date Updated"]);
                dataUpdated = statename["Date Updated"];
                // console.log('this is ' + statename);
                // htmldata = htmldata + '<a href="#!" class="collection-item">' + statename + '</a>';
                if (count > 6) {
                    count = 1;

                }
                state = statename.State;
                if (state == "Andaman and Nicobar Islands") {
                    state = "Andaman and Nicobar";
                }
                if (count == 1 || count == 2) {
                    color = 'orange ligten-2';
                }
                if (count == 3 || count == 4) {
                    color = 'white';
                }
                if (count == 5 || count == 6) {
                    color = 'green lighten-1';
                }
                htmldata = htmldata + `
                <div class="col s2 m2">

                    <div class="card ` + color + `">
                    <div class="card-content black-text">
                    <span class="card-title">` + state + `</span>
                    <p>Aadhaar Generated :</p> ` + statename["Aadhaar Generated"] + `
                    </div>
                
                    <div id = "` + state + `" class="card-action yellow lighten-4">
                    <a href="#!" onClick=getDataForChart("` + (state == "Andaman and Nicobar" ? encodeURIComponent("Andaman and Nicobar Islands") : encodeURIComponent(state)) + `")>Click to Get District Details</a>
                    
                    </div>
                    </div>
                </div>`;
                count = count + 1;
            });
            // htmldata = htmldata + '</div>';
            $("#statelist").append(htmldata);
            // console.log(JSON.stringify(result));
            // console.log(dataUpdated.substr(0, 4) + '-' + dataUpdated.substr(4, 2) + '-' + dataUpdated.substr(6, 2));
            var mydt = new Date(dataUpdated.substr(0, 4) + '-' + dataUpdated.substr(4, 2) + '-' + dataUpdated.substr(6, 2));
            $("#updateddate").append('Last Updated : ' + mydt.toDateString());
        },
        error: function(data) {
            console.log(JSON.stringify(data));
        }
    });


}



function getDataForChart(statename) {
    console.log('In getDataForChart ' + decodeURIComponent(statename));
    $.ajax({
        type: "POST",
        url: "/servedata",
        data: {
            "state": statename
        },
        // contentType: "application/json;",
        contentType: "application/x-www-form-urlencoded",
        dataType: "json",
        success: function(result) {
            console.log('In Success');
            // console.log(JSON.stringify(result));
            drawChart(result);
        },
        error: function(data) {
            console.log(JSON.stringify(data));
        }
    });


}

function getDataForStates() {
    $.ajax({
        type: "GET",
        url: "/getStateCounts",
        contentType: "application/x-www-form-urlencoded",
        dataType: "json",
        success: function(result) {
            console.log('In Success');
            // console.log(JSON.stringify(result));
            drawChart(result);
        },
        error: function(data) {
            console.log(JSON.stringify(data));
        }
    });

}

function drawChart(data) {
    var datatbl = new google.visualization.DataTable();

    // Declare columns
    datatbl.addColumn('string', 'District');
    datatbl.addColumn('number', 'Aadhar Generated');
    datatbl.addColumn('number', 'Enrolment Rejected');
    data.forEach(function(statedata) {
        datatbl.addRow([statedata.District, statedata["Aadhaar Generated"], statedata["Enrolment Rejected"]]);

    });

    var table = new google.visualization.Table(document.getElementById('stateinfo'));
    table.draw(datatbl, {
        showRowNumber: true,
        width: '100%',
        height: '100%'
    });
    $('#stateinfo').append(`<div class="modal-footer">
            <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Close</a>
        </div>`);
    $('#stateinfo').openModal();
}
