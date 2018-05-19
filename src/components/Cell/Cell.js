import React from 'react';
import styles from './Cell.css';
import Hole from '../Hole/Hole';

const cell = (props) => {
    return(
        <div className={styles.Cell} onClick={()=>{props.cellClick(props.col)}}>
            <Hole cellVal={props.cellVal}/>
        </div>
    )
}

export default cell; 