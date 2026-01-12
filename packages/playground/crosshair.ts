let showCrossHair = false;
document.addEventListener('keydown', e => {
    const shouldShowCrossHair = e.getModifierState('CapsLock');
    if (showCrossHair !== shouldShowCrossHair) {
        showCrossHair = shouldShowCrossHair;
        if (e.getModifierState('CapsLock')) {
            showCrosshair();
        } else {
            hideCrosshair();
        }
    }
});

let crosshairX: HTMLElement | undefined;
let crosshairY: HTMLElement | undefined;
function showCrosshair() {
    const element = document.createElement('div');
    element.id = 'crosshair';

    crosshairX = document.createElement('div');
    crosshairX.classList.add('crosshair-x');
    element.appendChild(crosshairX);
    crosshairY = document.createElement('div');
    crosshairY.classList.add('crosshair-y');
    element.appendChild(crosshairY);

    document.body.appendChild(element);
    element.classList.add('crosshair');

    document.addEventListener('mousemove', moveCrosshair, true);
}

function hideCrosshair() {
    const element = document.getElementById('crosshair');
    if (element) {
        element.remove();
    }
    crosshairX = undefined;
    crosshairY = undefined;
}

function moveCrosshair(e: MouseEvent) {
    if (!crosshairX) {
        document.removeEventListener('mousemove', moveCrosshair, true);
        return;
    }

    crosshairX!.style.left = `${e.pageX}px`;
    crosshairY!.style.top = `${e.pageY}px`;
}
