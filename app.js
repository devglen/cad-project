const { ipcRenderer, remote } = require( "electron" );
const jetpack = require('fs-jetpack');

document.addEventListener( "DOMContentLoaded", () => {
    console.log("USERDATA PATH:", remote.app.getPath("userData"));
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
        win.webContents.openDevTools();
    });

});

function getMachines() {
    try {
        var machinesContainer = document.getElementById("machines");
        var machineFiles = jetpack.list(remote.app.getPath("userData") + "/machines/");
        console.log(machineFiles);
    
        for (var i = 0; i < machineFiles.length; i++) {
            var machineFile = jetpack.read(remote.app.getPath("userData") + "/machines/" + machineFiles[i], "json");
            
            var header = document.createElement("h1");
            header.innerText = machineFile.name;

            var machineFileName = document.createElement("input");
            machineFileName.setAttribute("type", "hidden");
            machineFileName.setAttribute("id", "machine_filename_" + i);
            machineFileName.setAttribute("value", machineFiles[i]);

            var machineContainer = document.createElement("div");
            machineContainer.appendChild(header);
            machineContainer.appendChild(machineFileName);

            var inputCounter = 0;
            while (machineFile["input_title_" + inputCounter]) {
                var inputTitleLabel = document.createElement("label");
                inputTitleLabel.setAttribute("for", machineFile["input_title_" + inputCounter] + "_val");
                inputTitleLabel.innerText = machineFile["input_title_" + inputCounter];

                var inputValue = document.createElement("input");
                inputValue.setAttribute("type", "text");
                inputValue.setAttribute("name", machineFile["input_title_" + inputCounter] + "_val");
                inputValue.setAttribute("id", machineFile["input_title_" + inputCounter] + "_val");

                var paragraph = document.createElement("p");
                paragraph.appendChild(inputTitleLabel);
                paragraph.appendChild(inputValue);
                machineContainer.appendChild(paragraph);

                inputCounter++;
            }
            getOperationsForMachine(machineContainer, machineFile.name);

            machineContainer.appendChild(document.createElement("br"));

            var operationBtn = document.createElement("button");
            operationBtn.setAttribute("id", "newOperation+" + machineFile.name.split(" ").join("_"));
            operationBtn.setAttribute("class", "newOp");
            operationBtn.innerText = "Add Operation";
            
            machineContainer.appendChild(operationBtn);

            var generateBtn = document.createElement("button");
            generateBtn.setAttribute("id", "generateProgCode+" + machineFile.name.split(" ").join("_"));
            generateBtn.setAttribute("class", "genProgCode");
            generateBtn.innerText = "Generate Code";

            machineContainer.appendChild(generateBtn);

            machinesContainer.appendChild(machineContainer);

            machinesContainer.appendChild(document.createElement("hr"));

            console.log(machineFile);
        }
        initOperationBtnListeners();
        initCodeGenBtnListeners();
    } catch (e) {
        console.log("No Machines saved.");
    }
}

function initOperationBtnListeners() {
    var classname = document.getElementsByClassName("newOp");

    var newOpFunc = function() {
        var idVal = this.getAttribute("id");
        var machineName = idVal.split("+")[1];

        let win = new remote.BrowserWindow({
            parent: remote.getCurrentWindow(),
            modal: true
        });
    
        var theUrl = 'file://' + __dirname + '/add-operation.html?machine=' + machineName;
    
        win.loadURL(theUrl);
        win.webContents.openDevTools();
    };

    for (var i = 0; i < classname.length; i++) {
        classname[i].addEventListener('click', newOpFunc, false);
    }
}

function initCodeGenBtnListeners() {
    var classname = document.getElementsByClassName("genProgCode");

    var genCodeFunc = function() {
        var idVal = this.getAttribute("id");
        
        alert("TODO: WIP - Make this generate the code! ID val: " + idVal );
        //win.webContents.openDevTools();
    };

    for (var i = 0; i < classname.length; i++) {
        classname[i].addEventListener('click', genCodeFunc, false);
    }
}

function getOperationsForMachine(container, machineName) {
    try {
        var opsContainer = document.createElement("div");
        var operationFiles = jetpack.list(remote.app.getPath("userData") + "/operations/");
        console.log("operation files: " , operationFiles);

        if (!operationFiles) {
            container.appendChild(document.createElement("span"));
            return;
        }

        for (var i = 0; i < operationFiles.length; i++) {
            var formattedMachineName = machineName.split(" ").join("_");
            
            if (operationFiles[i].indexOf(formattedMachineName) < 0) {
                container.appendChild(opsContainer);
                continue;
            }

            var operationFile = jetpack.read(remote.app.getPath("userData") + "/operations/" + operationFiles[i], "json");

            var opContainer = document.createElement("div");
            opContainer.setAttribute("id", operationFile.name);

            var header = document.createElement("h5");
            header.innerText = operationFile.name;

            opContainer.appendChild(header);

            var opFileInfo = document.createElement("input");
            opFileInfo.setAttribute("type", "hidden");
            opFileInfo.setAttribute("value", operationFiles[i]);
            opFileInfo.setAttribute("id", "opfile_" + operationFiles[i] + "_" + i);

            opContainer.appendChild(opFileInfo);

            var inputCounter = 0;
            while (operationFile["input_title_" + inputCounter]) {
                var inputTitleLabel = document.createElement("label");
                inputTitleLabel.setAttribute("for", operationFile["input_title_" + inputCounter] + "_val");
                inputTitleLabel.innerText = operationFile["input_title_" + inputCounter];

                var inputValue = document.createElement("input");
                inputValue.setAttribute("type", "text");
                inputValue.setAttribute("name", operationFile["input_title_" + inputCounter] + "_val");
                inputValue.setAttribute("id", operationFile["input_title_" + inputCounter] + "_val");

                var paragraph = document.createElement("p");
                paragraph.appendChild(inputTitleLabel);
                paragraph.appendChild(inputValue);
                opContainer.appendChild(paragraph);

                inputCounter++;
            }

            if (inputCounter === 0) {
                var msgSpan = document.createElement("span");
                msgSpan.innerHTML = "<em>No inputs defined for this operation.</em>";
                opContainer.appendChild(msgSpan);
            }

            opsContainer.appendChild(opContainer);
        }

        container.appendChild(opsContainer);
    } catch (e) {
        console.log("ERROR!!!!", e);
    }
}

ipcRenderer.on( "dialog-response", ( e, arg ) => {
    console.log(arg.message);
});