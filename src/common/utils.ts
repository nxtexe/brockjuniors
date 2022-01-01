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
        const blob = await get_image(url);
        
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

export function share(title : string, text : string, url : string, files? : File[]) {
    const shareProxy : any = window.navigator;
    if (files?.length) {
        if (shareProxy.canShare && shareProxy.canShare({ files: files })) {
            shareProxy.share({
                text: text,
                files: files,
                title: title,
                url: url
            })
            .catch((e : Error) => {
                console.log(files)
            })
        } else {
            downloadFile(title, files);
        }
    } else {
        if (shareProxy.canShare) {
            shareProxy.share({
                text: text,
                title: title,
                url: url
            })
        }
    }
}

export function toggle_ticker(ref: HTMLElement | null) {
    if (ref) {
        if (ref.clientWidth < ref.scrollWidth) {
            if (!ref.className.includes('ticker')) {
                if (ref.parentElement) {
                    ref.parentElement.classList.add('animated');
                }
                ref.classList.add('ticker');
            }
        } else {
            if (ref.parentElement) {
                ref.classList.remove('animated');
            }
            ref.classList.remove('ticker');
        }
    }
}

export function get_css_text(styles: CSSStyleDeclaration): string {
    if (styles.cssText !== '') {
        return styles.cssText;
    } else {
        const css_text = Object.values(styles).reduce(
            (css, property_name) =>
                `${css}${property_name}:${styles.getPropertyValue(
                    property_name
                )};`
        );

        return css_text;
    }
}

export function shared_element_transition(start_element: HTMLElement, end_element: HTMLElement, parent_element: HTMLElement, duration?: number, easing_function?: string) {
    const transition_duration = duration || 200;
    
    const start_node: HTMLElement = (start_element.cloneNode(true) as HTMLElement);
    const end_node:HTMLElement = (end_element.cloneNode(true) as HTMLElement);

    const start_rect = start_element.getBoundingClientRect();
    const end_rect = end_element.getBoundingClientRect();
    
    start_node.className = "";
    start_node.style.cssText = get_css_text(window.getComputedStyle(start_element));
    start_node.style.opacity = '1';
    start_node.style.transform = `translate(${start_rect.x}px, ${start_rect.y}px)`;
    start_node.style.position = 'absolute';
    start_node.style.inset = 'unset';
    start_node.style.top = '0px';
    start_node.style.left = '0px';
    start_node.style.zIndex = '13000';
    start_node.style.transition = `all ${transition_duration || 200}ms ${easing_function || 'ease-in-out'}`;
    start_node.style.willChange = 'contents, transform, width, height, border-radius';

    parent_element.appendChild(start_node);

    end_node.className = "";
    end_node.style.cssText = get_css_text(window.getComputedStyle(end_element));
    end_node.style.opacity = '1';
    end_node.style.transform = `translate(${end_rect.x}px, ${end_rect.y}px)`;
    end_node.style.position = 'absolute';
    end_node.style.inset = 'unset';
    end_node.style.top = '0px';
    end_node.style.left = '0px';
    end_node.style.zIndex = '13000';
    end_node.style.transition = `all ${transition_duration || 200}ms ${easing_function || 'ease-in-out'}`;
    end_node.style.willChange = 'contents, transform, width, height, border-radius';


    start_element.style.opacity = '0';
    
    window.requestAnimationFrame(() => {
        start_node.style.cssText = get_css_text(end_node.style);
    });

    window.setTimeout(() => {
        end_element.style.opacity = '1';

        start_node.ontransitionend = null;
        parent_element.removeChild(start_node);
    }, transition_duration * 1.1);
}

export function closest(needle: number, haystack: number[]) {
    return haystack.reduce((a: number, b: number) => {
        let aDiff = Math.abs(a - needle);
        let bDiff = Math.abs(b - needle);

        if (aDiff == bDiff) {
            return a > b ? a : b;
        } else {
            return bDiff < aDiff ? b : a;
        }
    });
}