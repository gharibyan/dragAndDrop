/**
 * Created by xgharibyan on 9/28/17.
 */


'use strict';

import React from 'react';
import styles from './items.scss';
export default class SampleDisplay extends React.Component {

    render() {
        const itemStyle = {
            //display: 'block',
            //width: '100%',
            //height: '100%',
            //backgroundImage: `url('${this.props.item.url}')`
        };

        return <div
            style={itemStyle}
            className={styles.gridItem}>
            <img  style={{width:'100%'}} src={this.props.item.url}/>
        </div>;
    }
}