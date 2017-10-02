'use strict';

import React, {PropTypes, PureComponent, Component} from 'react';
import {debounce, sortBy} from 'lodash';
import createDisplayObject from './BaseDisplayObject.jsx';
import DragManager from './DragManager.js';
import LayoutManager from './LayoutManager.js';
import _each from 'lodash/each';

export default function createAbsoluteGrid(DisplayObject, displayProps = {}, forceImpure = false) {

    const Comp = forceImpure ? Component : PureComponent;
    const WrappedDisplayObject = createDisplayObject(DisplayObject, displayProps, forceImpure);

    return class extends Comp {
        static defaultProps = {
            items: [],
            keyProp: 'key',
            filterProp: 'filtered',
            sortProp: 'sort',
            itemWidth: 128,
            itemHeight: 128,
            verticalMargin: -1,
            responsive: false,
            dragEnabled: false,
            animation: 'transform 300ms ease',
            zoom: 1,
            onMove: () => {
            },
            onDragStart: () => {
            },
            onDragMove: () => {
            },
            onDragEnd: () => {
            }
        };

        static propTypes = {
            items: PropTypes.arrayOf(PropTypes.object).isRequired,
            itemWidth: PropTypes.number,
            itemHeight: PropTypes.number,
            verticalMargin: PropTypes.number,
            zoom: PropTypes.number,
            responsive: PropTypes.bool,
            dragEnabled: PropTypes.bool,
            keyProp: PropTypes.string,
            sortProp: PropTypes.string,
            filterProp: PropTypes.string,
            animation: PropTypes.string,
            onMove: PropTypes.func,
            onDragStart: PropTypes.func,
            onDragMove: PropTypes.func,
            onDragEnd: PropTypes.func
        };

        constructor(props, context) {
            super(props, context);
            this.onResize = debounce(this.onResize, 150);
            this.dragManager = new DragManager(
                this.props.onMove,
                this.props.onDragStart,
                this.props.onDragEnd,
                this.props.onDragMove,
                this.props.keyProp
            );



           /* let filteredIndex = 0;
            let sortedIndex = {};

            sortBy(this.state.items, this.props.sortProp).forEach(item => {
                if (!item[this.props.filterProp]) {
                    const key = item[this.props.keyProp];
                    sortedIndex[key] = filteredIndex;
                    filteredIndex++;
                }
            });

            _each(props.items, (item)=>{
                const key = item[this.props.keyProp];
                const index = sortedIndex[key];
                LayoutManager.pushElems({
                    itemWidth: this.props.itemWidth, //33.2%
                    itemHeight: item.height,
                    verticalMargin: this.props.verticalMargin,
                    zoom: this.props.zoom,
                    index:index,
                }, this.state.layoutWidth);
            });*/

            this.state = {
                layoutWidth: 0,
                items: props.items
            };
        }

        render() {

            let filteredIndex = 0;
            let sortedIndex = {};

            sortBy(this.state.items, this.props.sortProp).forEach(item => {
                if (!item[this.props.filterProp]) {
                    const key = item[this.props.keyProp];
                    sortedIndex[key] = filteredIndex;
                    filteredIndex++;
                }
            });

            const itemsLength = this.state.items.length;
            const gridItems = this.state.items.map(item => {
                const key = item[this.props.keyProp];
                const index = sortedIndex[key];

                return (
                    <WrappedDisplayObject
                        item={item}
                        index={index}
                        key={key}
                        itemsLength={itemsLength}
                        animation={this.props.animation}
                        itemWidth={this.props.itemWidth}
                        itemHeight={this.props.itemHeight}
                        layoutWidth={this.state.layoutWidth}
                        verticalMargin={this.props.verticalMargin}
                        zoom={this.props.zoom}
                        keyProp={this.props.keyProp}
                        filterProp={this.props.filterProp}
                        dragEnabled={this.props.dragEnabled}
                        dragManager={this.dragManager}
                    />
                );
            });

          /*  const options = {
                itemWidth: this.props.itemWidth,
                itemHeight: this.props.itemHeight,
                verticalMargin: this.props.verticalMargin,
                zoom: this.props.zoom
            };*/
            //const layout = new LayoutManager(options, this.state.layoutWidth);

            const gridStyle = {
                position: 'relative',
                display: 'block',
                height:  `100%`,
                padding:`20px`,
            };

            return (
                <div
                    style={gridStyle}
                    id={`grid_${this.props.id}`}
                    className="absoluteGrid"
                    ref={node => this.container = node}
                >
                    {gridItems}
                </div>
            );
        }

        componentDidMount() {
            //If responsive, listen for resize
            if (this.props.responsive) {
                window.addEventListener('resize', this.onResize);
            }
            this.onResize();
        }

        componentWillUnmount() {
            window.removeEventListener('resize', this.onResize);
        }

        componentWillReceiveProps(nextProps) {
            if (nextProps.items) {
                this.setState({items: nextProps.items});
            }
        }

        onResize = () => {
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(this.getDOMWidth);
            } else {
                setTimeout(this.getDOMWidth, 66);
            }
        };

        getDOMWidth = () => {
            const width = this.container && this.container.clientWidth;

            if (this.state.layoutWidth !== width) {
                this.setState({layoutWidth: width});
            }

        }

    }
}
