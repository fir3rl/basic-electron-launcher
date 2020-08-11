const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { Client, Authenticator } = require('minecraft-launcher-core');
const launcher = new Client();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        frame: false,
        title: "Lanceur MC",
        icon: path.join(__dirname, "/asset/logo.ico"),
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }

    })

    mainWindow.loadURL(path.join(__dirname, "index.html"))
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on("login", (event, data) => {
    Authenticator.getAuth(data.u, data.p).then(() => {
        event.sender.send("done")
        let opts = {
            clientPackage: null,
            authorization: Authenticator.getAuth(data.u, data.p),
            root: "C:/Users/Fir3/Desktop/Modpack",
            version: {
                number: "1.12.2",
                type: "release"
            },
            forge: "C:/Users/Fir3/Desktop/Modpack/forge.jar",
            memory: {
                max: "6000",
                min: "4000"
            }
        }

        launcher.launch(opts);

        launcher.on('debug', (e) => console.log(e));
        launcher.on('data', (e) => {
            console.log(e);
            mainWindow.hide();
        });
        launcher.on('progress', (e) => {
            console.log(e);
            event.sender.send("progression", e)
        });
    }).catch((err) => {
        event.sender.send("err", { er: err })
    })
})