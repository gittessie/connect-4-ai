import React from 'react';
import styles from './Hole.css';

const hole = (props) => {
    var classes = [];
    classes.push(styles.Hole);
    if(props.cellVal === 1){
        classes.push(styles.Black);
    }
    if(props.cellVal === 2){
        classes.push(styles.Red);
    }
    return(
        <div className={classes.join(' ')}>
        </div>
    )
}

export default hole; 