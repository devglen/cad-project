const { ipcRenderer, remote } = require( "electron" );
const jetpack = require('fs-jetpack');

document.addEventListener( "DOMContentLoaded", () => {

});

document.getElementById("saveMachine").addEventListener("click", function(){
    console.log("this should close!");

    var dataToSend = document.querySelector("form").serialize();

    var filename = document.getElementById("name").value.split(" ").join("_");
    jetpack.write("./machines/" + filename + ".json", dataToSend);
    alert("Form data: " + dataToSend);
    remote.getCurrentWindow().getParentWindow().reload();
    remote.getCurrentWindow().close();
});

document.getElementById("cancelMachine").addEventListener("click", function(){
    remote.getCurrentWindow().close();
});

document.getElementById("newParameter").addEventListener("click", function(){
    var paramContainer = document.getElementById("machineParameters");
    var paramCount = paramContainer.childElementCount;

    var paramLabel = document.createElement("label");
    paramLabel.setAttribute("for", "input_title_"+paramCount);
    paramLabel.innerText = "Input Key: ";

    var paramVal = document.createElement("input");
    paramVal.setAttribute("type", "text");
    paramVal.setAttribute("name", "input_title_"+paramCount);

    var lb = document.createElement("br");
    var container = document.createElement("div");
    container.appendChild(lb);

    container.appendChild(paramLabel);
    container.appendChild(paramVal);

    container.appendChild(lb);

    container.appendChild(paramLabel);
    container.appendChild(paramVal);

    paramContainer.appendChild(container);

});

HTMLElement.prototype.serialize = function(){
    var obj = {};
    var elements = this.querySelectorAll( "input, select, textarea" );
    for( var i = 0; i < elements.length; ++i ) {
        var element = elements[i];
        var name = element.name;
        var value = element.value;

        if( name ) {
            obj[ name ] = value;
        }
    }
    return JSON.stringify( obj );
}