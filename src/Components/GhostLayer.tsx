import React from 'react';
import '../css/GhostLayer.css';
import {TweenMax, Power3} from 'gsap';

interface GhostLayerProps {

}

interface GhostLayerState {

}
export default class GhostLayer extends React.Component<GhostLayerProps, GhostLayerState> {
    private _ghost_layer : HTMLDivElement | null = null;
    private _ghost_parent : HTMLDivElement | null = null;
    private _node : any | null = null;
    private _node_rect : ClientRect | null = null;
    componentDidMount() {
        window.addEventListener('shared-element-transition-start', (e) => {
            const computed_style = (e as CustomEvent).detail.computed_style;
            this._node = (e as CustomEvent).detail.node;
            this._node_rect = (e as CustomEvent).detail.bounding_client_rect;
            Array.from(computed_style).forEach(key => this._node.style.setProperty(key, computed_style.getPropertyValue(key), computed_style.getPropertyPriority(key)));

            
            
            if (this._node_rect) {
                this._ghost_parent?.appendChild(this._node);
                this._node.style.position = 'absolute';
                this._node.style.zIndex = 100000;
                this._node.style.left = `${this._node_rect.left}px`;
                this._node.style.top = `${this._node_rect.top}px`;
                this._node.style.bottom = `${this._node_rect.bottom}px`;
                this._node.style.right = `${this._node_rect.right}px`;
                this._ghost_layer?.classList.remove('hidden');
                this._ghost_layer?.classList.add('fade-in');
            }
            
        }, true);

        window.addEventListener('shared-element-transition-end', (e) => {
            const bounding_client_rect = (e as CustomEvent).detail.bounding_client_rect;
            const resolve = (e as CustomEvent).detail.resolve;
            
            if (this._node_rect) {
                TweenMax.to(
                    this._node,
                    .8,
                    {
                        top: bounding_client_rect.top,
                        bottom: bounding_client_rect.bottom,
                        left: bounding_client_rect.left,
                        right: bounding_client_rect.right,
                        ease: Power3.easeOut
                    }
                );
            }


            this._ghost_layer?.classList.remove('fade-in');
            setTimeout(() => {
                this._ghost_layer?.classList.add('fade-out');
            }, 800);
            setTimeout(() => {
                this._ghost_layer?.classList.add('hidden');
                this._ghost_parent?.removeChild(this._node);
                this._ghost_layer?.classList.remove('fade-out');

                resolve();
            }, 1800);
        }, true);
    }
    componentWillUnmount() {
        window.removeEventListener('shared-element-transition-start', ()=>{});
        window.removeEventListener('shared-element-transition-end', ()=>{});
    }
    static start_handoff(node : Node, computed_style : CSSStyleDeclaration, bounding_client_rect : ClientRect) {
        const event = new CustomEvent('shared-element-transition-start', {
            detail: {
                node: node,
                computed_style: computed_style,
                bounding_client_rect: bounding_client_rect
            }
        });

        window.dispatchEvent(event);
    }
    static end_handoff(bounding_client_rect : ClientRect) {
        return new Promise((resolve, reject) => {
            const event = new CustomEvent('shared-element-transition-end', {
                detail: {
                    resolve: resolve,
                    reject: reject,
                    bounding_client_rect: bounding_client_rect
                }
            });

            window.dispatchEvent(event);
        });
    }
    render() {
        return (
            <div ref={c => this._ghost_parent = c} className="ghost-layer">
                <div ref={c => this._ghost_layer = c}  className="hidden">
                </div>
            </div>
        );
    }
}