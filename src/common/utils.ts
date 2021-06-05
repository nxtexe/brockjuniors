import localforage from 'localforage';
import ColorThief from 'colorthief';
import axios from 'axios';

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

export function toggle_dark_mode(darko_mode : boolean) {
    const theme = darko_mode ? 'darko-mode' : 'lighto-mode';
    if (darko_mode) {
        setThemeColour('#000000');
    } else {
        setThemeColour('#d8d8d8');
    }
    localforage.setItem('theme', theme)
    .then(async () => {
        const body = document.getElementsByTagName('body')[0];
        body.className=theme;
    })
    .catch(e => {
        throw e;
    });
}

export function is_overflowing(el : any) {
    var curOverf = el.style.overflow;
    
    if ( !curOverf || curOverf === "visible" )
        el.style.overflow = "hidden";
      
    var isOverflowing = el.clientWidth < el.scrollWidth
        || el.clientHeight < el.scrollHeight;
      
    el.style.overflow = curOverf;
      
    return isOverflowing;
}
export function format_from_duration(duration : number) {
    return duration < 3600 ? duration < 600 ? 'm:ss' : 'mm:ss' : 'h:mm:ss';
}
export function get_image(url : string) : Promise<Blob> {
    return new Promise(function(resolve, reject) {
        axios.get(url, {
            responseType: 'blob'
        }).then(response => {
            resolve(response.data);
        }).catch(err => {
            reject(err);
        });
    });
}
export function componentToHex(c : number) : string {
  var hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}
export function rgbToHex(r : number, g : number, b : number) : string {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
export function generate_artwork(url : string) : Promise<string> {
    const colour_thief = new ColorThief();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const image = new Image();

    
    
    return new Promise(async (resolve, reject) => {
        const blob = await get_image(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
        
        image.onload = () => {
            let src : string = image.src;
            const aspect = image.width / image.height;
            const preserved_height = canvas.width / aspect;
            canvas.width = 512;
            canvas.height = 512;
            const centre = canvas.width / 2;
            const cx = centre - (canvas.width / 2);
            const cy = centre - (preserved_height / 2);
    
            
    
            const fill_colour = colour_thief.getColor(image);
            const hex = rgbToHex(fill_colour[0], fill_colour[1], fill_colour[2]);
            
            if (context) {
                context.fillStyle = hex;
                context.fillRect(0, 0, canvas.width, canvas.height)
                context.drawImage(image, 0, 0, image.width, image.height, cx, cy, canvas.width, preserved_height);
    
                src = canvas.toDataURL('image/png');
            }
    
            resolve(src);
        }


        image.src = URL.createObjectURL(blob);
    });

    
}