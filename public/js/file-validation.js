
let control = document.getElementById("upload-files");

control.addEventListener("change", function(event) {
    // When the control has changed, there are new files
    let files = control.files
        for (let i = 0; i < files.length; i++) {
        console.log("Filename: " + files[i].name);
        console.log("Type: " + files[i].type);
        console.log("Size: " + files[i].size + " bytes");
        let blob = files[i]; // See step 1 above
        console.log(blob.type);
        let fileReader = new FileReader();
            fileReader.onloadend = function(e) {
                let arr = (new Uint8Array(e.target.result)).subarray(0, 4);
                let header = "";
                for(let i = 0; i < arr.length; i++) {
                    header += arr[i].toString(16);
                }
                console.log(header);
                switch (header) {
                    case "89504e47":
                        type = "image/png";
                        break;
                    case "47494638":
                        type = "image/gif";
                        break;
                    case "ffd8ffe0":
                    case "ffd8ffe1":
                    case "ffd8ffe2":
                    case "ffd8ffe3":
                    case "ffd8ffe8":
                        type = "image/jpeg";
                        break;
                    case "00018":
                    case "00020":
                        type = "image/heic"
                        // window.location.replace("/invalidheic");
                        console.log(window.location.hostname)
                        break;
                    default:
                        type = "unknown"; // Or you can use the blob.type as fallback

                        window.location.replace("/invalidheic");

                        break;
                }
                console.log(type)

                // Check the file signature against known types

            };
            fileReader.readAsArrayBuffer(blob);
    }
}, false);
