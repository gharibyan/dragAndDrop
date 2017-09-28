/**
 * Created by xgharibyan on 6/7/17.
 */

import * as React from "react";

import createAbosluteGrid from '../../components/absoluteGrid';
import Items from '../../components/items/items'
import _find from 'lodash/find';
import _uniqBy from 'lodash/uniqBy';
import _remove from 'lodash/remove';
import _findIndex from 'lodash/findIndex';
import styles from './index.scss';

const imgId = [1011, 883, 1074, 823, 64, 65, 839, 314, 256, 316, 92, 643, 1, 2, 3, 4, 5, 20];
const AbsoluteGrid = new createAbosluteGrid(Items, {});
const AbsoluteGrid2 = new createAbosluteGrid(Items, {});


let items = imgId.reduce((acc, val, key) => {
    const ih = 200 + Math.floor(Math.random() * 10) * 15;
    acc.push({
        url:`https://unsplash.it/250/${ih}?image=${val}`,
        sort: key,
        key: key
    });
    return acc;
}, []);


class Main extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            items: items,
            items2: [],
        };
        this.onMove = this.onMove.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.pushItem = this.pushItem.bind(this);
    }

    pushItem(items, sort) {
        const vaseVersa = items === 'items2' ? 'items' : 'items2';
        const indexOfRemovingElement = _findIndex(this.state[vaseVersa], (item) => item.url === this.source.url);

        this.state[items].push(this.source);
        this.state[items] = _remove(_uniqBy(this.state[items], 'url'), undefined);
        if (indexOfRemovingElement > -1) {
            this.state[vaseVersa].splice(indexOfRemovingElement, 1)
        }
        if (sort)
            this.sortItems(items, this.source, this.target);

        delete this.target;
        delete this.source;
        delete this.destinationChanged;
        this.setState({
            [items]: this.state[items],
            [vaseVersa]: this.state[vaseVersa]
        })
    }

    onMove(origin, destination, items) {
        const vaseVersa = items === 'items2' ? 'items' : 'items2';
        this.destinationChanged = false;

        let source = _find(this.state[items], {key: parseInt(origin, 10)});
        let target = _find(this.state[items], {key: parseInt(destination, 10)});

        if (!target) {
            target = _find(this.state[vaseVersa], {key: parseInt(destination, 10)});
            this.destinationChanged = target ? vaseVersa : false;
            this.target = target;
        }

        this.source = source;

        if (!target && this.source) return;

        if (this.destinationChanged) return;

        this.sortItems(items, source, target);
        this.setState({[`${items}`]: this.state[items]});
    }

    sortItems(items, source, target) {
        const targetSort = target.sort;
        this.state[items] = this.state[items].map((item) => {
            //Decrement sorts between positions when target is greater
            if (item.key === source.key) {
                return {
                    ...item,
                    sort: targetSort
                }
            } else if (target.sort > source.sort && (item.sort <= target.sort && item.sort > source.sort)) {
                return {
                    ...item,
                    sort: item.sort - 1
                };
                //Increment sorts between positions when source is greater
            } else if (item.sort >= target.sort && item.sort < source.sort) {
                return {
                    ...item,
                    sort: item.sort + 1
                };
            }
            return item;
        });
    }

    onDragEnd(e) {
        if (!e) return;
        console.log(e);
        const isTouch = e.changedTouches;
        const clientX = isTouch ? e.changedTouches[0].clientX : e.clientX;
        const clientY = isTouch ? e.changedTouches[0].clientY : e.clientY;
        const targetElement = document.elementFromPoint(clientX, clientY);
        const gridId = targetElement.getAttribute('id');
        const itemsArr = this.destinationChanged || (gridId === 'grid_right' ? 'items2' : gridId === 'grid_left' ? 'items' : false);
        if (itemsArr) {
            this.pushItem(itemsArr, !!this.destinationChanged);
        }
    }

    render() {
        return (
            <div className={styles['flexbox-container']}>
                <div id="left" className={[styles['grid-item']].join(' ')}>
                    <AbsoluteGrid items={this.state.items}
                                  id="left"
                                  onMove={(source, target) => this.onMove(source, target, 'items')}
                                  onDragEnd={this.onDragEnd}
                                  dragEnabled={true}
                                  responsive={true}
                                  verticalMargin={42}
                                  itemWidth={200}
                                  itemHeight={180}
                    />
                </div>

                <div id="right" className={[styles['grid-item']].join(' ')}>
                    <AbsoluteGrid2 items={this.state.items2}
                                   id="right"
                                   onMove={(source, target) => this.onMove(source, target, 'items2')}
                                   onDragEnd={this.onDragEnd}
                                   dragEnabled={true}
                                   responsive={true}
                                   verticalMargin={42}
                                   itemWidth={200}
                                   itemHeight={180}
                    />

                </div>
            </div>
        )
    }
}

export default Main;

