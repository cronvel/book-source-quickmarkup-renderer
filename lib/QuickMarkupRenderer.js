/*
	Book Source QuickMarkup Renderer

	Copyright (c) 2024 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



function QuickMarkupRenderer( theme ) {	//, params = {} ) {
	// Theme is mandatory
	this.theme = theme ;
	//this.colors = {} ;
}

module.exports = QuickMarkupRenderer ;



QuickMarkupRenderer.prototype.type = 'string' ;



// Tables are not supported ATM...
//const group = QuickMarkupRenderer.prototype.group = {} ;



// Render the full document, called last with all content rendered
QuickMarkupRenderer.prototype.document = function( meta , renderedChildren ) {
	return renderedChildren ;
} ;



// Block



QuickMarkupRenderer.prototype.paragraph = function( data , renderedChildren ) {
	return renderedChildren + '\n\n' ;
} ;



QuickMarkupRenderer.prototype.quote = function( data , renderedChildren ) {
	return renderedChildren + '\n\n' ;
} ;



QuickMarkupRenderer.prototype.pre_header = function( data , _ignore , usrStack ) {
	var usr = usrStack[ usrStack.length - 1 ] ,
		lastFullMarkup = usrStack[ usrStack.length - 2 ]?.fullMarkup || '' ;

	usr.markup = '^+' ;
	usr.fullMarkup = lastFullMarkup + usr.markup ;
} ;

QuickMarkupRenderer.prototype.header = function( data , renderedChildren , _ignore , usrStack ) {
	var markup = usrStack[ usrStack.length - 1 ]?.markup || '' ,
		lastFullMarkup = usrStack[ usrStack.length - 2 ]?.fullMarkup || '' ,
		level = Math.min( 6 , data.level ) ;

	return '\n\n\n' + '  '.repeat( level - 1 ) + markup + '# ' + renderedChildren + '^:' + lastFullMarkup + '\n\n\n' ;
} ;



QuickMarkupRenderer.prototype.cite = function( data , renderedChildren ) {
	return '^/' + renderedChildren + '^:\n' ;
} ;



QuickMarkupRenderer.prototype.list = function( data , renderedChildren ) {
	return renderedChildren + '\n' ;
} ;



QuickMarkupRenderer.prototype.listItem = function( data , renderedChildren ) {
	return ' '.repeat( data.indent ) + '• ' + renderedChildren + '\n' ;
} ;



QuickMarkupRenderer.prototype.orderedList = function( data , renderedChildren ) {
	return renderedChildren + '\n' ;
} ;



QuickMarkupRenderer.prototype.orderedListItem = function( data , renderedChildren ) {
	return ' '.repeat( data.indent ) + data.index + '. ' + renderedChildren + '\n' ;
} ;



QuickMarkupRenderer.prototype.codeBlock = function( data , renderedChildren ) {
	return '\n---\n' + renderedChildren + '\n---\n\n' ;
} ;



// Inline



QuickMarkupRenderer.prototype.text = function( data ) {
	return this.toTextNode( data.text ) ;
} ;



QuickMarkupRenderer.prototype.pre_emphasisText = function( data , _ignore , usrStack ) {
	var usr = usrStack[ usrStack.length - 1 ] ,
		lastFullMarkup = usrStack[ usrStack.length - 2 ]?.fullMarkup || '' ;

	if ( data.level === 2 ) {
		usr.markup = '^+' ;
	}
	else if ( data.level >= 3 ) {
		usr.markup = '^+^/' ;
	}
	else {
		usr.markup = '^/' ;
	}

	usr.fullMarkup = lastFullMarkup + usr.markup ;
} ;

QuickMarkupRenderer.prototype.emphasisText = function( data , renderedChildren , _ignore , usrStack ) {
	var markup = usrStack[ usrStack.length - 1 ]?.markup ,
		lastFullMarkup = usrStack[ usrStack.length - 2 ]?.fullMarkup || '' ;

	return markup + renderedChildren + '^:' + lastFullMarkup ;
} ;



QuickMarkupRenderer.prototype.pre_decoratedText = function( data , _ignore , usrStack ) {
	var usr = usrStack[ usrStack.length - 1 ] ,
		lastFullMarkup = usrStack[ usrStack.length - 2 ]?.fullMarkup || '' ;

	if ( data.level >= 2 ) {
		// It supports 2 levels, but there is no spec for that ATM
		usr.markup = '^_' ;
	}
	else {
		usr.markup = '^_' ;
	}

	usr.fullMarkup = lastFullMarkup + usr.markup ;
} ;

QuickMarkupRenderer.prototype.decoratedText = function( data , renderedChildren , _ignore , usrStack ) {
	var markup = usrStack[ usrStack.length - 1 ]?.markup || '' ,
		lastFullMarkup = usrStack[ usrStack.length - 2 ]?.fullMarkup || '' ;

	return markup + renderedChildren + '^:' + lastFullMarkup ;
} ;



QuickMarkupRenderer.prototype.code = function( data , renderedChildren , _ignore , usrStack ) {
	var lastFullMarkup = usrStack[ usrStack.length - 2 ]?.fullMarkup || '' ;
	return '^:^[bg:gray]' + this.toTextNode( data.text ) + '^:' + lastFullMarkup ;
} ;



QuickMarkupRenderer.prototype.pre_link = function( data , _ignore , usrStack ) {
	var usr = usrStack[ usrStack.length - 1 ] ,
		lastFullMarkup = usrStack[ usrStack.length - 2 ]?.fullMarkup || '' ;

	usr.markup = '^_' ;
	usr.fullMarkup = lastFullMarkup + usr.markup ;
} ;

QuickMarkupRenderer.prototype.link = function( data , renderedChildren , _ignore , usrStack ) {
	var markup = usrStack[ usrStack.length - 1 ]?.markup || '' ,
		lastFullMarkup = usrStack[ usrStack.length - 2 ]?.fullMarkup || '' ;

	return markup + renderedChildren + '^:' + lastFullMarkup ;
} ;



QuickMarkupRenderer.prototype.pre_styledText = function( data , _ignore , usrStack ) {
	var usr = usrStack[ usrStack.length - 1 ] ,
		lastFullMarkup = usrStack[ usrStack.length - 2 ]?.fullMarkup || '' ;

	usr.markup = this.styleToMarkup( data.style ) ;
	usr.fullMarkup = lastFullMarkup + usr.markup ;
} ;

QuickMarkupRenderer.prototype.styledText = function( data , renderedChildren , _ignore , usrStack ) {
	var markup = usrStack[ usrStack.length - 1 ]?.markup || '' ,
		lastFullMarkup = usrStack[ usrStack.length - 2 ]?.fullMarkup || '' ;

	return markup + renderedChildren + '^:' + lastFullMarkup ;
} ;



QuickMarkupRenderer.prototype.pictogram = function( data ) {
	if ( data.emoji ) {
		return this.toTextNode( data.emoji ) ;
	}

	return '' ;
} ;



// Helpers



QuickMarkupRenderer.prototype.toTextNode = function( text ) {
	return text.replace( /\^/g , '^^' ) ;
} ;



const COLOR_LETTER_CODE = {
	red: 'r' ,
	yellow: 'y' ,
	green: 'g' ,
	cyan: 'c' ,
	blue: 'b' ,
	magenta: 'm' ,
	white: 'w' ,
	black: 'k' ,
	gray: 'K' ,
	grey: 'K'
} ;

QuickMarkupRenderer.prototype.styleToMarkup = function( style ) {
	if ( ! style ) { return '' ; }

	var markup = '' ;

	if ( style.bold ) { markup += '^+' ; }
	if ( style.italic ) { markup += '^/' ; }
	if ( style.underline ) { markup += '^_' ; }

	if ( style.textColor ) {
		if ( COLOR_LETTER_CODE[ style.textColor.baseName ] ) {
			let letter = COLOR_LETTER_CODE[ style.textColor.baseName ] ;
			if ( style.textColor.lightnessLevel > 0 ) { letter = letter.toUpperCase() ; }
			markup += '^' + letter ;
		}
	}

	if ( style.backgroundColor ) {
		if ( COLOR_LETTER_CODE[ style.backgroundColor.baseName ] ) {
			let letter = COLOR_LETTER_CODE[ style.backgroundColor.baseName ] ;
			if ( style.backgroundColor.lightnessLevel > 0 ) { letter = letter.toUpperCase() ; }
			markup += '^#^' + letter ;
		}
	}

	return markup ;
} ;

