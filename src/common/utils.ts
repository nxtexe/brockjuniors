export function downloadFile(title : string, files : File[]) {
    files.map((file) => {
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.setAttribute("style", "display: none");
        const url = window.URL.createObjectURL(file);
        a.href = url;
        a.download = title;
        a.click();
        window.URL.revokeObjectURL(url);
        return null;
    });
}

export function iOS() : boolean {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

export function isMobile() : boolean {
    if (
        navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)
    )
        return true;
    return false;
}
/**
 * Checks the validity of email including null check.
 * @param {String} email Email to be validated
 */
 export function ValidateEmail(email : string) : boolean 
 {
     if (email.length === 0) {
         return false;
     }
     
     return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(email);
 }
 
 export function setThemeColour(color : string) {
    const theme = document.getElementsByName("theme-color")[0];

    if (theme) {
        theme.setAttribute('content', color);
    }
}
/**
 * Disabled page scrolling.
 */
 export function disableScroll() {
    const html = document.getElementsByTagName('html')[0];
    html.style.overflowY = "hidden";
    html.style.overflowX = "hidden";
    html.style.overscrollBehavior = "none";
}

/**
 * Enable page scrolling.
 */
export function enableScroll() {
    const html = document.getElementsByTagName('html')[0];
    html.style.overflowY = "visible";
    html.style.overflowX = "visible";
    html.style.overscrollBehavior = "auto";
}
