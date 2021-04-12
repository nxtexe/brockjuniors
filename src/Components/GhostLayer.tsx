import React from 'react';
import '../css/GhostLayer.css';
import {TweenMax, Power3} from 'gsap';

interface GhostLayerProps {

}

interface GhostLayerState {

}
export default class GhostLayer extends React.Component<GhostLayerProps, GhostLayerState> {
    private _ghost_layer : HTMLDivElement | null = null;

    componentDidMount() {
        window.addEventListener('shared-element-transition', (e) => {
            const computed_style = (e as CustomEvent).detail.computed_style;
            const node = (e as CustomEvent).detail.node;
            const bounding_client_rect = (e as CustomEvent).detail.bounding_client_rect;
            Array.from(computed_style).forEach(key => node.style.setProperty(key, computed_style.getPropertyValue(key), computed_style.getPropertyPriority(key)));

            
            
            this._ghost_layer?.appendChild(node);
            node.style.position = 'absolute';
            node.style.left = `${bounding_client_rect.left}px`;
            node.style.top = `${bounding_client_rect.top}px`;
            node.style.bottom = `${bounding_client_rect.bottom}px`;
            node.style.right = `${bounding_client_rect.right}px`;
            this._ghost_layer?.classList.remove('hidden');
            TweenMax.to(
                node,
                .8,
                {
                    y: -bounding_client_rect.y / 2,
                    x: 0,
                    ease: Power3.easeInOut
                }
            )
        }, true);

        
    }
    componentWillUnmount() {
        window.removeEventListener('shared-element-transition', ()=>{});
    }
    static start_handoff(node : Node, computed_style : CSSStyleDeclaration, bounding_client_rect : ClientRect) {
        const event = new CustomEvent('shared-element-transition', {
            detail: {
                node: node,
                computed_style: computed_style,
                bounding_client_rect: bounding_client_rect
            }
        });

        window.dispatchEvent(event);
    }
    static end_handoff() {

    }
    render() {
        return (
            <div ref={c => this._ghost_layer = c} className="ghost-layer hidden">
            </div>
        );
    }
}