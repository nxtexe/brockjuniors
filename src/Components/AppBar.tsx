import React from 'react';


interface AppBarProps {
    adornments : any[];
}

export default function AppBar(props : AppBarProps) {
    return (
        <div className="app-bar-wrap">
            <div className="app-bar screen-grid">
                <div className="adornments">
                    {props.adornments?.map((adornment, index) => {
                        return <div key={index} className="adornment">{adornment}</div>
                    })}
                </div>
            </div>
        </div>
    );
}