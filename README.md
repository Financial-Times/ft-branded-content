# FT Brand Site Template
This is a template for use by any developers at the FT and third parties creating branded FT content.

## What does it include?

### 1. FT header and footer

You know it.

### 2. Paid Post tooltip

This is configured as follows:
- On page load, it shows for 5 seconds, then closes automatically if the user hasn't dismissed it already. 
- If the tooltip is open, it will close once the user starts scrolling
- The white "Paid post by Sponsor" box will remain stuck to the top of the screen as the user scrolls down

### 3. Events

These events are sent to the FT data platform (redshift). We measure 3 things out of the box:
- _Attention time_ - Measures how long the user has spent on this page.  It fires once the user naviagtes away from the page.
- _Scroll depth_ - 4 Separate events that fire when the user has reached 25%, 50%, 75% and 100% of the article content
- _Clicks_ - Any links (`<a>`), buttons (`<button>`) and inputs (`<input>`) are tracked automatically.


**Debugging events:**

To check that these events are firing correctly:
1. Open up the page in Chrome browser
2. Open the Network tab
3. In the _filter_ box, type `px`
4. Reload the page

You should see a request to `px.gif?type=page:view`. This is the page view event. If you scroll far enough down the page, you should see one or more requests to `px.gif?type=page:scrolldepth`. And if you click on any links or buttons, you should see a request to `px.gif?type=page:cta` (Although you might navigate away from the page before you can see this).

### 4. Origami components

We include the following components out of the box:
- o-grid
- o-viewport
- o-header
- o-footer
- o-tooltip
- o-tracking
- o-buttons

To find out more about these and Origami in general, here's the [Origami site](http://origami.ft.com/)

### 5. Pixels

The following pixels or tags are included:
 - Facebook
 - Twitter
 - Krux

## Sounds cool, how do I use this thing?

### Replace content

All you need is the [index.html](https://raw.githubusercontent.com/Financial-Times/ft-header-footer/master/index.html) file from this repository. Download it and open it up in an editor.

Everything that needs replacing is of the format `[[REPLACE ME]]`. Use the search function in your editor (CTRL (or CMD) + F) to search and replace the following options:

 - **[[PAGE TITLE]]** - Pretty self explanatory
 - **[[SPONSOR]]** - This will appear in the white box under the header in the form "Paid Post by SPONSOR"
 - **[[CONTENT]]** - This is where you put your code
 - **[[PARENT ARTICLE]]** - (Optional) If this article is part of a larger story, replace this with the title of the parent article. If not delete the code where you find this. If in doubt, delete it.


### Adding Origami components

You can add extra Origami components if you need too. Here's that link to the [Origami Docs](http://origami.ft.com/) again.

If the component you need only requires javascript, open `index.html` in an editor and search for `js?modules`. You'll see a line of code with the source of the origami build service, which includes all of the components mentioned above. Add your component name and version here. **Do not delete any of the components already here**

If you're component also requires css, then search for `css?modules` and do the same.

All Origami component are loaded on the `window.Origami` global object. 

## I want to make some changes to the template

Good for you. It's not the most sophisticated setup. To get up and running:

1. Clone the repo
2. `npm install`
3. `npm run demo`

You'll have the template running locally. To make any changes to the js or css, you'll have to replace the _ft.com_ urls with local ones for `dist/brand-site.css` and `dist/brand-site.js`. `webpack` will build the js and css into the `dest/` folder and since I told you it's not sophisticated, you'll have to do this every time you change some js. Which hopefully shouldn't be that often.

Once you're happy with the changes, log into AWS, find the `ft-next-assets-prod` bucket and upload the files in your local `dist/` folder to the `paid-post` folder in this bucket. **Note: make sure to give them read access**

Go back to your local copy of `index.html`. Change the css and js links back to point to `https://www.ft.com/__assets/creatives/paid-post/branded-content.css (and .js)`. Commit and go have a beer.



## Disclaimer
!! This repository is not kept up to date.
