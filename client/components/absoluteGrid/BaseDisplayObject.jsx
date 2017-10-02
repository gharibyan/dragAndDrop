'use strict';

import React, {PropTypes, PureComponent, Component} from 'react';

import Manager from './LayoutManager.js';

const LayoutManager = Manager.LayoutManager;

export default function createDisplayObject(DisplayObject, displayProps, forceImpure) {

    const Comp = forceImpure ? Component : PureComponent;

    return class extends Comp {
        static propTypes = {
            item: PropTypes.object,
            style: PropTypes.object,
            index: PropTypes.number,
            dragEnabled: PropTypes.bool,
            dragManager: PropTypes.object,
            itemsLength: PropTypes.number
        };

        state = {};

        getElemBaseCoordinates(e) {
            const isTouch = e.changedTouches;
            const clientX = isTouch ? e.changedTouches[0].clientX : e.clientX;
            const clientY = isTouch ? e.changedTouches[0].clientY : e.clientY;
            const targetElement = document.elementFromPoint(clientX, clientY);
            const gridId = targetElement.getAttribute('id');
            return gridId;
        }

        getParentNode() {
            return this.domNode.parentNode.getAttribute('id');
        }

        getCoordinates(domNode, e) {
            let childrenPos = domNode.getBoundingClientRect();
            let relativePos = {};
            const isTouch = e.changedTouches;
            const clientX = isTouch ? e.changedTouches[0].clientX : e.pageX;
            const clientY = isTouch ? e.changedTouches[0].clientY : e.pageY;
            const grid = this.getElemBaseCoordinates(e);

            if (grid !== this.getParentNode()) {
                relativePos.left =((clientX - childrenPos.left) + domNode.offsetWidth / 2); //- (domNode.offsetWidth / 2)
                relativePos.top = ((clientY - childrenPos.top) + (domNode.offsetHeight / 2));//+ (domNode.offsetHeight / 2)
                relativePos.outer = true;
                return relativePos;
            }

            //console.log('childrenPos', childrenPos, (domNode.offsetWidth / 2), (domNode.offsetHeight / 2));
            //return {left:childrenPos.left, top:childrenPos.top, outer:false}

        }

        updateDrag(x, y, e) {

            //Pause Animation lets our item return to a snapped position without being animated
            let pauseAnimation = false;
            //if (this.getElemBaseCoordinates(e) !== this.getParentNode()) {
            this.props.item.coords = this.getCoordinates(this.domNode, e, true);
            delete this.props.hover;
            if (!this.props.dragManager.dragItem) {
                if (this.getElemBaseCoordinates(e) !== this.getParentNode()) {
                    pauseAnimation = true;
                    setTimeout(() => {
                        if (!this._mounted) return;
                        this.setState({pauseAnimation: false});
                    }, 20);
                }
                else {
                    if(this.getParentNode() == 'grid_right'){
                        pauseAnimation = true;
                        setTimeout(() => {
                            if (!this._mounted) return;
                            this.setState({pauseAnimation: false});
                        }, 20);
                    }
                    else{
                        this.domNode.style.transition = `transform 300ms ease`;
                        setTimeout(() => {
                            setTimeout(() => {
                                if (!this._mounted) return;
                                this.setState({pauseAnimation: false});
                            }, 20);
                        }, 100);
                    }
                }

            }
            this.setState({
                dragX: x,
                dragY: y,
                pauseAnimation: pauseAnimation
            });
        }

        onDrag = (e) => {
            if (this.props.dragManager) {
                this.props.dragManager.startDrag(e, this.domNode, this.props.item, this.updateDrag.bind(this));
            }
        };

        getStyle(hoverEvent) {
            const options = {
                itemWidth: this.props.itemWidth, //33.2%
                itemHeight: this.props.itemHeight,
                verticalMargin: this.props.verticalMargin,
                zoom: this.props.zoom,
                index:this.props.index,
            };
            const layout = new LayoutManager(options, this.props.layoutWidth);

            const style = layout.getStyle(
                this.props.index,
                this.props.animation,
                this.props.item[this.props.filterProp],
                hoverEvent || this.props.item.hover
            );

            //If this is the object being dragged, return a different style
            if (this.props.dragManager.dragItem &&
                this.props.dragManager.dragItem[this.props.keyProp] === this.props.item[this.props.keyProp]) {
                const dragStyle = this.props.dragManager.getStyle(this.state.dragX, this.state.dragY);
                return {...style, ...dragStyle};
            }

            else if (this.state && this.state.pauseAnimation) {
                const pauseAnimationStyle = {...style};
                pauseAnimationStyle.WebkitTransition = 'none';
                pauseAnimationStyle.MozTransition = 'none';
                pauseAnimationStyle.msTransition = 'none';
                pauseAnimationStyle.transition = 'none';
                return pauseAnimationStyle;
            }

            /**
             * Hack animation for state changing event
             */
            if (this.props.item.coords) {
                style.transition = `transform 300ms ease`;
                style.transformOrig = style.transform;
                style.transform = `translate3d(${this.props.item.coords.left}px, ${this.props.item.coords.top}px, 0)`;
                setTimeout(() => {
                    this.domNode.style.transform = style.transformOrig;
                }, this.props.item.coords.outer ? 0 : 300);
                delete this.props.item.coords;
                return style;
            }
            return style;
        }

        onHover = (e, hoverIn) => {
            //this.props.item.hover = hoverIn;
            setTimeout(()=>{
                const style = this.getStyle(hoverIn);
                this.domNode.style.WebkitTransform = style.transform;
                this.domNode.style.MozTransform = style.transform;
                this.domNode.style.MozTransform = style.transform;
                this.domNode.style.transform = style.transform;
                //this.domNode.style.zIndex = hoverIn ? 100 : 0;
            }, 100)
        };


        componentDidMount() {
            if (this.props.dragEnabled) {
                this.domNode.addEventListener('mousedown', this.onDrag);
                this.domNode.addEventListener('touchstart', this.onDrag);
                this.domNode.addEventListener('mouseover', (e) => this.onHover(e, true));
                this.domNode.addEventListener('mouseout', (e) => this.onHover(e, false));

                this.domNode.setAttribute('data-key', this.props.item[this.props.keyProp]);
            }
            this._mounted = true;
        }

        componentWillUnmount() {
            if (this.props.dragEnabled) {
                this.props.dragManager.endDrag();
                this.domNode.removeEventListener('mousedown', this.onDrag);
                this.domNode.removeEventListener('touchstart', this.onDrag);
            }
            this._mounted = false
        }

        render() {
            return (
                <div data-index={this.props.index} ref={node => this.domNode = node} style={this.getStyle()}>
                    <DisplayObject
                        {...displayProps}
                        item={this.props.item}
                        index={this.props.index}
                        itemsLength={this.props.itemsLength}/>
                </div>
            );
        }
    }
}
