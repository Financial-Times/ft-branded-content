'use strict'

// require('./brand-content.css');

// Initialise Events
var ATTENTION_INTERVAL = 15000;
var ATTENTION_EVENTS = ['load', 'click', 'focus', 'scroll', 'mousemove', 'touchstart', 'touchend', 'touchcancel', 'touchleave'];
var UNATTENTION_EVENTS = ['blur'];
var EXIT_EVENTS = ['beforeunload', 'unload', 'pagehide'];

function throttle(func, wait) {
	let last, timer;
	
	return function() {
		const now = +new Date;
		const args = arguments;
		const context = this;
		
		if(last && now < last + wait) {
			clearTimeout(timer);
			timer = setTimeout(function() {
				last = now;
				func.apply(context, args);
			}, wait);
		}
		else {
			last = now;
			func.apply(context, args);
		}
	}
}

function oTrackinginit() {
	// oTracking
	const oTracking = Origami['o-tracking'];
	const sponsor = document.querySelector('meta[name="sponsor"]');
	const parent = document.querySelector('meta[name="parent"]');
	const config_data = {
		server: 'https://spoor-api.ft.com/px.gif',
		context: {
			product: 'paid-post',
			content: {
				title: document.querySelector('title').textContent,
				parent: parent ? parent.getAttribute('content') : null,
				sponsor: sponsor ? sponsor.getAttribute('content') : null
			}
		},
		user: {
			ft_session: oTracking.utils.getValueFromCookie(/FTSession=([^;]+)/)
		}
	}
	// Setup
	oTracking.init(config_data);
	// Automatically track clicks
	oTracking.click.init('cta');
	// Page
	oTracking.page(
	{
		content: {
			asset_type: 'page'
		}
	}
	);
}

function stickyOnScroll() {
	// Sticky ads
	const adTargetEl = document.getElementById('paid-post-tooltip-target');
	const adContentEl = document.getElementById('paid-post-tooltip');
	const headerEl = document.getElementsByClassName('o-header')[0];
	const adPosTop = headerEl.getBoundingClientRect().height;
	const closeEl = document.getElementsByClassName('o-tooltip-close')[0];
	const tooltipEl = document.querySelector('.o-tooltip');

	function closeTooltip() {
		if(tooltipEl && tooltipEl.style.display === 'block') {
			closeEl.dispatchEvent(new Event('click', {"bubbles":true }));
		}
	}
	
	window.addEventListener('scroll', throttle(closeTooltip, 2000));
	window.addEventListener('scroll', function() {
		const lastScrollPos = window.scrollY;
		if(lastScrollPos > adPosTop) {
			adTargetEl.classList.add('sticky');
			adContentEl.classList.add('sticky');
		} else {
			adTargetEl.classList.remove('sticky');
			adContentEl.classList.remove('sticky');
		}
	});
}

function broadcast (name, data, bubbles = true) {
	const rootEl = Element.prototype.isPrototypeOf(this) ? this : document.body;
	let event;

	try {
		event = new CustomEvent(name, {bubbles: bubbles, cancelable: true, detail: data});
	} catch (e) {
		event = CustomEvent.initCustomEvent(name, true, true, data);
	}
	rootEl.dispatchEvent(event);
};


class Attention {
	constructor () {
		this.totalAttentionTime = 0;
		this.startAttentionTime;
		this.endAttentionTime;
		this.hasSentEvent = false;
	}

	init () {

		//Add events for all the other Attention events
		for (let i = 0; i < ATTENTION_EVENTS.length; i++) {
			window.addEventListener(ATTENTION_EVENTS[i], ev => this.startAttention(ev));
		}

		for (let i = 0; i < UNATTENTION_EVENTS.length; i++) {
			window.addEventListener(UNATTENTION_EVENTS[i], ev => this.endAttention(ev));
		}

		// Need to wait for this to be available
		window.Origami['o-viewport'].listenTo('visibility');
		document.body.addEventListener('oViewport.visibility', ev => this.handleVisibilityChange(ev), false);

		this.addVideoEvents();

		// Add event to send data on unload
		EXIT_EVENTS.forEach(event => {
			window.addEventListener(event, () => {
				if(this.hasSentEvent) {
					return;
				}
				this.hasSentEvent = true;
				this.endAttention();
				broadcast('oTracking.event', {
					category: 'page',
					action: 'interaction',
					context: {
						attention: {
							total: this.totalAttentionTime
						}
					}
				});
			});
		});

	}

	startAttention () {
		clearTimeout(this.attentionTimeout);
		if(!this.startAttentionTime) {
			this.startAttentionTime = (new Date()).getTime();
		}
		this.attentionTimeout = setTimeout(() => this.endAttention(), ATTENTION_INTERVAL);
	}

	startConstantAttention () {
		this.constantAttentionInterval = setInterval(() => this.startAttention(), ATTENTION_INTERVAL);
	}

	endConstantAttention () {
		this.endAttention();
		clearInterval(this.constantAttentionInterval);
	}

	endAttention () {
		if(this.startAttentionTime) {
			this.endAttentionTime = (new Date()).getTime();
			this.totalAttentionTime += Math.round((this.endAttentionTime - this.startAttentionTime)/1000);
			clearTimeout(this.attentionTimeout);
			this.startAttentionTime = null;
		}
	}

	get () {
		//getter should restart attention capturing as endAttention updates the value:
		this.endAttention();
		this.startAttention();
		return this.totalAttentionTime;
	}

	addVideoEvents () {
		this.videoPlayers = document.getElementsByTagName('video');
		for (let i = 0; i < this.videoPlayers.length; i++) {
			this.videoPlayers[i].addEventListener('playing', ev => this.startConstantAttention(ev));
			this.videoPlayers[i].addEventListener('pause', ev => this.endConstantAttention(ev));
			this.videoPlayers[i].addEventListener('ended', ev => this.endConstantAttention(ev));
		}
	}

	handleVisibilityChange (ev) {
		if (ev.detail.hidden) {
			this.endAttention();
		} else {
			this.startAttention();
		}
	}

}

function fireBeacon (contextSource, percentage) {
	const data = {
		action: 'scrolldepth',
		category: 'page',
		meta: {
			percentagesViewed: percentage,
			attention: window.attention.get()
		},
		context: {
			product: 'next',
			source: contextSource
		}
	};
	broadcast('oTracking.event', data);
};

function scrollDepthInit(contextSource, { percentages = [25, 50, 75, 100], selector = 'body'} = { }) {
		if (!(contextSource && contextSource.length)) {
			throw new Error('contextSource required');
		}

		const intersectionCallback = (observer, changes) => {
			changes.forEach(change => {
				if(change.isIntersecting || change.intersectionRatio > 0) {
					const scrollDepthMarkerEl = change.target;
					fireBeacon(contextSource, scrollDepthMarkerEl.getAttribute('data-percentage'));
					if (scrollDepthMarkerEl.parentNode) {
						scrollDepthMarkerEl.parentNode.removeChild(scrollDepthMarkerEl);
					}
					observer.unobserve(scrollDepthMarkerEl);
				}
			});
		};


		const element = document.querySelector(selector);
		if (element && window.IntersectionObserver) {
			const observer = new IntersectionObserver(
				function (changes) {
					intersectionCallback(this, changes);
				}
			);
			percentages.forEach(percentage => {
				
				// add a scroll depth marker element
				const targetEl = document.createElement('div');
				targetEl.className = 'n-ui__scroll-depth-marker';
				targetEl.style.position = 'absolute';
				targetEl.style.top = `${percentage}%`;
				targetEl.style.bottom = '0';
				targetEl.style.width = '100%';
				targetEl.style.zIndex = '-1';
				targetEl.setAttribute('data-percentage', percentage);
				element.appendChild(targetEl);
				observer.observe(targetEl);
			});
		}
};

// Load origami components and initialise things
function init() {
	window.attention = new Attention();

	// Need to make some changes to the DOM before initialising the
	// origami components so we fire off the o.DOMContentLoaded when
	// we're ready.
	document.addEventListener('DOMContentLoaded', function() {
		if(window.innerWidth < 740) {
			document.getElementById('paid-post-tooltip').setAttribute('data-o-tooltip-position', 'below');
		}
	});

	const intervalId = setInterval(function() {
		if(window.Origami) {
			clearInterval(intervalId);
			clearTimeout(timeoutId);
			document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
			if(cutsTheMustard) {
				oTrackinginit();
			}
			else {
				// Add fallback if browsers don't cut the mustard -->
				var img = new Image();
				img.src = 'https://spoor-api.ft.com/px.gif?data=%7B%22category%22:%22page%22,%20%22action%22:%22view%22,%20%22system%22:%7B%22apiKey%22:%22qUb9maKfKbtpRsdp0p2J7uWxRPGJEP%22,%22source%22:%22o-tracking%22,%22version%22:%221.0.0%22%7D,%22context%22:%7B%22product%22:%22paid-post%22,%22content%22:%7B%22asset_type%22:%22page%22%7D%7D%7D';
			}
			stickyOnScroll();
			window.attention.init();
			scrollDepthInit('paid-post', { selector: '#content'});
		}
	}, 20);
	
	const timeoutId = setTimeout(function() {
		clearInterval(intervalId);
	}, 5000);
}

// Webpack exposes these on a window.ft global object for use by the page
module.exports = {
	init
}