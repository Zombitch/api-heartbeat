var selectedDetail = null;

function getDashboardData(config){
    return fetch("http://localhost:3000/"+config+"/heartbeat")
        .then(fetchRes => fetchRes.json())
}

function refresh(config){
    getDashboardData(config).then(json => {
        const dateTime = new Date();
        let lastCall = document.getElementById("lastCall");
        let content = document.getElementById("content");
        let details = document.getElementById("details");
        content.innerHTML = "";
        details.innerHTML = "";
        lastCall.innerText = "Mis à jour à " + dateTime.getHours().toString().padStart(2, '0') + ":" + dateTime.getMinutes().toString().padStart(2, '0') + ":" + dateTime.getSeconds().toString().padStart(2, '0');
        Object.keys(json).sort().forEach(key => {
            if(json[key]["succeed"]){
                content.insertAdjacentHTML("beforeend", '<div class="row container" onclick="javascript:showDetails(\''+key+'\')"><div class="pulsar"><div class="content"></div><div class="pulse"></div></div><div class="text">'+key+'</div></div>');
            }else{
                content.insertAdjacentHTML("beforeend", '<div class="row container" onclick="javascript:showDetails(\''+key+'\')"><div class="pulsar-danger"><div class="content"></div><div class="pulse"></div></div><div class="text">'+key+'</div></div>');
            }
            details.insertAdjacentHTML("afterbegin", '<div class="row row-details text" id="'+key+'" style="display:none">'+JSON.stringify(json[key], null, 4)+'</div>');
        });

        if(selectedDetail) showDetails(selectedDetail);
    });
}

function run(config){
    refresh(config);
    setInterval(() => {refresh(config)}, 60000);
}

function showDetails(elId){
    selectedDetail = elId;
    let detailElement = document.getElementById(elId);
    let detailContainerElement = document.getElementById("details");
    Array.prototype.forEach.call(document.getElementsByClassName("row-details"), function(el) {
        el.style.display = "none";
    });
    detailElement.style.display = "block";
    detailContainerElement.style.display = "block";
}