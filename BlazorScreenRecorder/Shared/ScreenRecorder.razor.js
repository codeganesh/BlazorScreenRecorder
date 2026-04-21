export async function addScreenToVideo(videoElement, screenOptions, dotNetHelper) {

    try {

        videoElement.dotNetHelper = dotNetHelper;


        var screen = await navigator.mediaDevices.getDisplayMedia(screenOptions);



        screen.getTracks()[0].onended = async () => {

            videoElement.srcObject = null;
            videoElement.muted = true;

            await videoElement.dotNetHelper.invokeMethodAsync("ScreenEnded");
        }

        videoElement.srcObject = screen;
        videoElement.muted = true;



    }
    catch (err) {
        throw err.message;
    }
}

export function getRecorder(videoElement) {
    var chunks = [];

    var screen = videoElement.srcObject;

    var options = null;


    if (MediaRecorder.isTypeSupported("video/mp4")) {

        options = {
            mime: "video/mp4",
            ext: "mp4"
        }
    }
    else {
        options = {
            mime: "video/webm",
            ext: "webm"
        }
    }

    var recorder = new MediaRecorder(screen, { mimeType: options.mime });
    recorder.ondataavailable = function onDataAvailable(e) {

        if (e.data.size > 0) {
            chunks.push(e.data);
        }
    }
    recorder.onstop = async function onStop() {

        var blob = new Blob(chunks, { type: recorder.mimeType });
        var mediaBlobUrl = URL.createObjectURL(blob);

        
        screen.getTracks().forEach(track => {
            track.stop();
        });

        videoElement.srcObject = null;

        await videoElement.dotNetHelper.invokeMethodAsync("RecordComplete", mediaBlobUrl,options.ext);
    }

    return recorder;



}