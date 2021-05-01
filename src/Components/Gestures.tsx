import { useSpring, animated } from 'react-spring'
import { useDrag } from 'react-use-gesture';
import ButtonBase from '@material-ui/core/ButtonBase';
import {useState} from 'react';
import {isMobile} from '../common/utils';

export function PullRelease(props : any) : JSX.Element {
    const [{ transform }, set] = useSpring(() => ({ transform: `translate(${0}px, ${0}px)` }))
    const threshold : number = props.threshold || 200;

    const [canAnimate, setCanAnimate] = useState(true);
    // Set the drag hook and define component movement based on gesture data
    const bind = useDrag(({ last, down, movement: [mx, my], cancel }) => {
      if (props.YClamp || my < props.YClamp) {
        cancel();
      } else if (canAnimate) {
        set({ transform: `translate(${down ? mx : 0}px, ${down ? my : 0}px)` });
      }
  
      if (props.onDrag && last && Math.abs(my) > threshold) {
        setCanAnimate(false);
        set({ transform: `translate(${mx}px, ${my}px)` });
        props.onDrag();
      }
    }, {axis: 'y', swipeVelocity: [2, 2], swipeDistance: [25, 25]});
    // Bind it to a component
    return (
      <animated.div
        ref={props._ref}
        className={props.className}
        {...bind()}
        style={{ ...props.style, ...{transform}, touchAction: 'none' }}
        >
          {props.children}
        </animated.div>
    );
}

export function LongPress(props : any) : JSX.Element {
  let timer_id : number;
  const [is_clickable, set_clickable] = useState(true);
  const start_timer = () => {
    timer_id = window.setTimeout(() => {
      //only presses that last as long as delay will be considered long press. Else consider as click.
      set_clickable(false);
      props.onLongPress();
    }, props.delay ? props.delay : 500);
  };
  const end_timer = (e : any) => {
    if (is_clickable && props.onClick && e.button === 0) props.onClick();

    setTimeout(() => {
      set_clickable(true);
    }, 500);
    clearTimeout(timer_id);
  };
  return (
    <ButtonBase
      className={props.className}
      style={props.style}
      onTouchStart={start_timer}
      onTouchEnd={end_timer}
      onMouseDown={start_timer}
      onMouseUp={end_timer}
      onContextMenu={isMobile() ? undefined : props.onContextMenu}
    >
      {props.children}
    </ButtonBase>
  );
}