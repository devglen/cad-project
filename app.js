const { ipcRenderer, remote } = require( "electron" );
const jetpack = require('fs-jetpack');

document.addEventListener( "DOMContentLoaded", () => {
    const version = process.version;
    const e = document.getElementById( "info" );
    e.textContent = `I'm running Node.js version: ${ version }`;

    getMachines();

    const btn = document.getElementById( "createMachine" );
    btn.addEventListener( "click", e => {
        console.log( "I was clicked." );
        
        //ipcRenderer.send( "show-dialog", { message: "The button was clicked" } );

        let win = new remote.BrowserWindow({
            parent: remote.getCurrentWindow(),
            modal: true
        });
    
        var theUrl = 'file://' + __dirname + '/add-machine.html'
        console.log('url', theUrl);
    
        win.loadURL(theUrl);
    });

    

} );

document.getElementById("saveMachine").addEventListener("click", function(){
    console.log("this should close!");

    var dataToSend = document.querySelector("form").serialize();

    var filename = document.getElementById("machineName").value.split(" ").join("_");
    jetpack.write("./machines/" + filename + ".json", dataToSend);
    alert("Form data: " + dataToSend);
    remote.getCurrentWindow().getParentWindow().reload();
    var window = remote.getCurrentWindow();
    window.close();
});

document.getElementById("newParameter").addEventListener("click", function(){
    var paramContainer = document.getElementById("machineParameters");
    var paramCount = paramContainer.childElementCount;

    var paramKey = document.createElement("label");
    paramKey.setAttribute("for", "key_val_"+paramCount);
    paramKey.innerText = "Key: ";

    var paramVal = document.createElement("input");
    paramVal.setAttribute("type", "text");
    paramVal.setAttribute("name", "key_val_"+paramCount);

    var paramKey2 = document.createElement("label");
    paramKey2.setAttribute("for", "val_val_"+paramCount);
    paramKey2.innerText = "Value: ";

    var paramVal2 = document.createElement("input");
    paramVal2.setAttribute("type", "text");
    paramVal2.setAttribute("name", "val_val_"+paramCount);

    var lb = document.createElement("br");
    var container = document.createElement("div");
    container.appendChild(lb);

    container.appendChild(paramKey);
    container.appendChild(paramVal);

    container.appendChild(lb);

    container.appendChild(paramKey2);
    container.appendChild(paramVal2);

    paramContainer.appendChild(container);

});

function getMachines() {
    var machineFiles = jetpack.list("./machines/");
    console.log(machineFiles);
}

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

ipcRenderer.on( "dialog-response", ( e, arg ) => {
    console.log(arg.message);
});