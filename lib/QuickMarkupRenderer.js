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



const escape = require( 'string-kit/lib/escape.js' ) ;
const camel = require( 'string-kit/lib/camel.js' ) ;

// /!\ Maybe it should not be loaded here, but passed as the constructor argument
const highlight = require( 'highlight.js' ) ;



function HtmlRenderer( theme , params = {} ) {
	// Theme is mandatory
	this.theme = theme ;

	this.standalone = !! params.standalone ;

	this.coreCss = params.coreCss ? params.coreCss.trim() + '\n' : '' ;
	this.extraCoreCss = params.extraCoreCss ? params.extraCoreCss.trim() + '\n' : '' ;

	this.standaloneCss = params.standaloneCss ? params.standaloneCss.trim() + '\n' : '' ;
	this.extraStandaloneCss = params.extraStandaloneCss ? params.extraStandaloneCss.trim() + '\n' : '' ;

	// Hilighter
	this.codeCss = params.codeCss ? params.codeCss.trim() + '\n' : '' ;
	this.extraCodeCss = params.extraCodeCss ? params.extraCodeCss.trim() + '\n' : '' ;

	this.colors = {} ;
}

module.exports = HtmlRenderer ;



HtmlRenderer.prototype.type = 'string' ;



// Builtin CSS
const path = require( 'path' ) ;

HtmlRenderer.getBuiltinCssPath = type => {
	switch ( type ) {
		case 'core' :
		case 'standalone' :
		case 'code' :
			return path.join( __dirname , '..' , 'css' , type + '.css' ) ;
	}

	throw new Error( "There is no built-in CSS of type '" + type + "'" ) ;
} ;

HtmlRenderer.getBuiltinCssSync = type => {
	const fs = require( 'fs' ) ;
	return fs.readFileSync( HtmlRenderer.getBuiltinCssPath( type ) , 'utf8' ) ;
} ;

HtmlRenderer.getBuiltinCss = type => {
	const fs = require( 'fs' ) ;
	return fs.promises.readFile( HtmlRenderer.getBuiltinCssPath( type ) , 'utf8' ) ;
} ;



const group = HtmlRenderer.prototype.group = {} ;



// Render the full document, called last with all content rendered
HtmlRenderer.prototype.document = function( meta , renderedChildren ) {
	var scope = this.standalone ? 'body' : '.book-source' ,
		str = '' ;

	if ( this.standalone ) {
		let css = '' ;

		if ( this.standaloneCss ) { css += this.standaloneCss ; }
		if ( this.extraStandaloneCss ) { css += this.extraStandaloneCss ; }
		if ( this.coreCss ) { css += this.coreCss ; }
		if ( this.extraCoreCss ) { css += this.extraCoreCss ; }
		if ( this.codeCss ) { css += this.codeCss ; }
		if ( this.extraCodeCss ) { css += this.extraCodeCss ; }

		str += '<!DOCTYPE html>\n' ;
		str += '<html>\n' ;
		str += '<head>\n' ;
		str += '\t<title>' + ( meta.title || 'Document with no name' ) + '</title>\n' ;
		str += '\t<meta charset="UTF-8" />\n' ;

		str += '\t<style>\n' ;
		str += this.generateThemeColorCss( scope ) ;
		str += this.generateThemeSizeCss( scope ) ;
		str += this.generateThemeOtherCss( scope ) ;
		str += this.generateColorCss( scope ) ;
		if ( css ) { str += css ; }
		str += '\t</style>\n' ;

		str += '</head>\n' ;
		str += '<body>\n' ;
	}

	str += '<div class="book-source">\n' ;
	str += renderedChildren ;
	str += '\n</div>\n' ;

	if ( this.standalone ) {
		str += '</body>\n' ;
		str += '</html>\n' ;
	}

	return str ;
} ;



// Block



HtmlRenderer.prototype.paragraph = function( data , renderedChildren ) {
	return '<p>' + renderedChildren + '</p>\n' ;
} ;



HtmlRenderer.prototype.quote = function( data , renderedChildren ) {
	return '<blockquote>' + renderedChildren + '</blockquote>\n' ;
} ;



HtmlRenderer.prototype.header = function( data , renderedChildren ) {
	var level = Math.min( 6 , data.level ) ;
	return '<h' + level + '>' + renderedChildren + '</h' + level + '>\n' ;
} ;



HtmlRenderer.prototype.cite = function( data , renderedChildren ) {
	return '<cite>' + renderedChildren + '</cite>\n' ;
} ;



HtmlRenderer.prototype.list = function( data , renderedChildren ) {
	return '<ul>\n' + renderedChildren + '</ul>\n' ;
} ;



HtmlRenderer.prototype.listItem = function( data , renderedChildren ) {
	return '<li>' + renderedChildren + '</li>\n' ;
} ;



HtmlRenderer.prototype.orderedList = function( data , renderedChildren ) {
	return '<ol>\n' + renderedChildren + '</ol>\n' ;
} ;



HtmlRenderer.prototype.orderedListItem = function( data , renderedChildren ) {
	return '<li>' + renderedChildren + '</li>\n' ;
} ;



HtmlRenderer.prototype.imageBlock = function( data ) {
	var str = '<figure' ;
	if ( data.float ) { str += ' class="float float-' + this.toAttrNode( data.float ) + '"' ; }
	str += '>\n' ;

	str += '<img src="' + this.toAttrNode( data.href ) + '"' ;
	if ( data.altText ) { str += ' alt="' + this.toAttrNode( data.altText ) + '"' ; }
	if ( data.title ) { str += ' title="' + this.toAttrNode( data.title ) + '"' ; }
	str += ' />\n' ;

	if ( data.caption ) { str += '<figcaption>' + this.toTextNode( data.caption ) + '</figcaption>\n' ; }
	str += '</figure>\n' ;

	return str ;
} ;



HtmlRenderer.prototype.horizontalRule = function( data ) {
	var str = '<hr' ;
	if ( data.clearFloat ) { str += ' class="clear-float"' ; }
	str += ' />\n' ;
	return str ;
} ;



HtmlRenderer.prototype.clearFloat = function( data ) {
	return '<div class="clear-float"></div>\n' ;
} ;



HtmlRenderer.prototype.codeBlock = function( data ) {
	var str = '<pre>\n' ;
	str += '<code' ;
	if ( data.lang ) { str += ' class="lang-' + this.toAttrNode( data.lang ) + '"' ; }
	str += '>' ;	// <-- no \n here, it would cause a blank line at the top of the code

	if ( data.lang ) {
		str += highlight.highlight( data.text , { language: data.lang } ).value ;
	}
	else {
		str += this.toTextNode( data.text ) ;
	}

	str += '</code>\n' ;
	str += '</pre>\n' ;
	return str ;
} ;



group.table = {} ;

HtmlRenderer.prototype.table = function( data , renderedChildren ) {
	return '<table>\n' + renderedChildren + '</table>\n' ;
} ;



group.table.tableCaption = function( data , renderedChildren ) {
	// Markup is produced by the tableCaption
	return renderedChildren ;
} ;

group.table.tableCaption.order = 1 ;



group.table.tableHeadRow = function( data , renderedRows ) {
	return '<thead>\n' + renderedRows + '</thead>\n' ;
} ;

group.table.tableHeadRow.order = 2 ;



group.table.tableRow = function( data , renderedRows ) {
	return '<tbody>\n' + renderedRows + '</tbody>\n' ;
} ;

group.table.tableRow.order = 3 ;



HtmlRenderer.prototype.tableCaption = function( data , renderedChildren ) {
	var str = '<caption' ;

	var classes = new Set() ;
	if ( data.style ) { this.styleToClasses( data.style , classes ) ; }
	if ( classes.size ) { str += ' class="' + this.setToClassAttr( classes ) + '"' ; }

	str += '>' + renderedChildren + '</caption>\n' ;
	return str ;
} ;



HtmlRenderer.prototype.tableRow = function( data , renderedChildren ) {
	var str = '<tr' ;

	var classes = new Set() ;
	if ( data.style ) { this.styleToClasses( data.style , classes ) ; }
	if ( data.rowSeparator ) { classes.add( 'row-separator' ) ; }
	if ( classes.size ) { str += ' class="' + this.setToClassAttr( classes ) + '"' ; }

	str += '>' + renderedChildren + '</tr>\n' ;
	return str ;
} ;



HtmlRenderer.prototype.tableHeadRow = function( data , renderedChildren ) {
	var str = '<tr' ;

	var classes = new Set() ;
	if ( data.style ) { this.styleToClasses( data.style , classes ) ; }
	if ( data.rowSeparator ) { classes.add( 'row-separator' ) ; }
	if ( classes.size ) { str += ' class="' + this.setToClassAttr( classes ) + '"' ; }

	str += '>' + renderedChildren + '</tr>\n' ;
	return str ;
} ;



HtmlRenderer.prototype.tableCell = function( data , renderedChildren , stack ) {
	var tableData = stack[ stack.length - 3 ] ,
		columnData = tableData.columns[ data.column ] ;

	var str = '<td' ;

	var classes = new Set() ;

	switch ( columnData?.align ) {
		case 'right' :
			classes.add( 'align-right' ) ;
			break ;
		case 'left' :
			classes.add( 'align-left' ) ;
			break ;
		case 'center' :
			classes.add( 'align-center' ) ;
			break ;
		case 'justify' :
			classes.add( 'align-justify' ) ;
			break ;
	}

	if ( columnData?.columnSeparator || data.columnSeparator ) { classes.add( 'column-separator' ) ; }

	if ( columnData?.style ) {
		if ( data.style ) { this.styleToClasses( columnData.style.merge( data.style ) , classes ) ; }
		else { this.styleToClasses( columnData.style , classes ) ; }
	}
	else if ( data.style ) {
		this.styleToClasses( data.style , classes ) ;
	}

	if ( classes.size ) { str += ' class="' + this.setToClassAttr( classes ) + '"' ; }

	if ( data.columnSpan ) { str += ' colspan="' + data.columnSpan + '"' ; }
	if ( data.rowSpan ) { str += ' rowspan="' + data.rowSpan + '"' ; }

	str += '>' + renderedChildren + '</td>\n' ;
	return str ;
} ;



HtmlRenderer.prototype.tableHeadCell = function( data , renderedChildren , stack ) {
	var tableData = stack[ stack.length - 3 ] ,
		columnData = tableData.columns[ data.column ] ;

	var str = '<th' ;

	var classes = new Set() ;
	if ( columnData?.columnSeparator || data.columnSeparator ) { classes.add( 'column-separator' ) ; }
	if ( data.style ) { this.styleToClasses( data.style , classes ) ; }
	if ( classes.size ) { str += ' class="' + this.setToClassAttr( classes ) + '"' ; }

	if ( data.columnSpan ) { str += ' colspan="' + data.columnSpan + '"' ; }
	if ( data.rowSpan ) { str += ' rowspan="' + data.rowSpan + '"' ; }

	if ( data.isRowHead && ! data.isColumnHead ) { str += ' scope="row"' ; }
	else if ( data.isColumnHead && ! data.isRowHead ) { str += ' scope="column"' ; }

	str += '>' + renderedChildren + '</th>\n' ;
	return str ;
} ;



// Inline



HtmlRenderer.prototype.text = function( data ) {
	return this.toTextNode( data.text ) ;
} ;



HtmlRenderer.prototype.emphasisText = function( data ) {
	if ( data.level === 2 ) {
		return '<strong>' + this.toTextNode( data.text ) + '</strong>' ;
	}

	if ( data.level >= 3 ) {
		return '<strong><em>' + this.toTextNode( data.text ) + '</em></strong>' ;
	}

	return '<em>' + this.toTextNode( data.text ) + '</em>' ;
} ;



HtmlRenderer.prototype.decoratedText = function( data ) {
	if ( data.level >= 2 ) {
		// It supports 2 levels, but there is no spec for that ATM
		return '<span class="underline">' + this.toTextNode( data.text ) + '</span>' ;
	}

	return '<span class="underline">' + this.toTextNode( data.text ) + '</span>' ;
} ;



HtmlRenderer.prototype.code = function( data ) {
	return '<code>' + this.toTextNode( data.text ) + '</code>' ;
} ;



HtmlRenderer.prototype.link = function( data ) {
	var str = '<a href="' + this.toAttrNode( data.href ) + '"' ;
	if ( data.title ) { str += ' title="' + this.toAttrNode( data.title ) + '"' ; }
	str += '>' + this.toTextNode( data.text ) + '</a>' ;
	return str ;
} ;



HtmlRenderer.prototype.styledText = function( data ) {
	var str = '<span' ;

	var classes = new Set() ;
	if ( data.title ) { classes.add( "title-tooltip" ) ; }
	if ( data.style ) { this.styleToClasses( data.style , classes ) ; }
	if ( classes.size ) { str += ' class="' + this.setToClassAttr( classes ) + '"' ; }

	if ( data.title ) { str += ' title="' + this.toAttrNode( data.title ) + '"' ; }
	str += '>' + this.toTextNode( data.text ) + '</span>' ;
	return str ;
} ;



HtmlRenderer.prototype.image = function( data ) {
	var str = '<img src="' + this.toAttrNode( data.href ) + '"' ;
	if ( data.altText ) { str += ' alt="' + this.toAttrNode( data.altText ) + '"' ; }
	if ( data.title ) { str += ' title="' + this.toAttrNode( data.title ) + '"' ; }
	str += ' />' ;
	return str ;
} ;



HtmlRenderer.prototype.pictogram = function( data ) {
	var str = '' ;

	if ( data.emoji ) {
		str += '<span class="pictogram-emoji"' ;
		if ( data.title ) { str += ' title="' + this.toAttrNode( data.title ) + '"' ; }
		if ( data.altText ) { str += ' title="' + this.toAttrNode( data.altText ) + '"' ; }
		str += '>' + this.toTextNode( data.emoji ) + '</span>' ;
		return str ;
	}

	return '' ;

	/*
	var str = '<img src="' + this.toAttrNode( data.href ) + '"' ;
	if ( data.altText ) { str += ' alt="' + this.toAttrNode( data.altText ) + '"' ; }
	if ( data.title ) { str += ' title="' + this.toAttrNode( data.title ) + '"' ; }
	str += ' />' ;
	return str ;
	*/
} ;



// Misc



HtmlRenderer.prototype.anchor = function( data ) {
	return '<a name="' + this.toAttrNode( data.href ) + '"></a>\n' ;
} ;



// CSS renderer



// Should be called after everything else is rendered, because it use a list generated by styleToClasses
HtmlRenderer.prototype.generateColorCss = function( scope ) {
	var defStr , rulesStr , cname , color , colorCode , varName ,
		ruleScopePrefix = scope === 'body' ? '' : '.book-source ' ;

	defStr = scope + ' {\n' ;
	rulesStr = '' ;

	for ( cname in this.colors ) {
		color = this.colors[ cname ] ;
		colorCode = this.theme.palette.getHex( color ) ;
		varName = '--color-' + cname ;
		defStr += '\t' + varName + ': ' + colorCode + ';\n' ;
		rulesStr += ruleScopePrefix + '.text-' + cname + ' { color: var(' + varName + '); }\n' ;
		rulesStr += ruleScopePrefix + '.bg-' + cname + ' { background-color: var(' + varName + '); }\n' ;
	}

	defStr += '}\n\n' ;

	return defStr + rulesStr + '\n' ;
} ;



HtmlRenderer.prototype.generateThemeColorCss = function( scope ) {
	var defStr , cname , property , varName , value , valueStr ;

	defStr = scope + ' {\n' ;

	for ( property in this.theme.colors ) {
		value = this.theme.colors[ property ] ;
		varName = '--' + camel.camelCaseToDash( property ) + '-color' ;

		if ( value && typeof value === 'object' ) {
			cname = value.cname() ;
			valueStr = 'var(--color-' + cname + ')' ;
			if ( ! this.colors[ cname ] ) { this.colors[ cname ] = value ; }
		}
		else {
			valueStr = value ;
		}

		defStr += '\t' + varName + ': ' + valueStr + ';\n' ;
	}

	defStr += '}\n\n' ;

	return defStr ;
} ;



HtmlRenderer.prototype.generateThemeSizeCss = function( scope ) {
	var defStr , cname , property , varName , value ;

	defStr = scope + ' {\n' ;

	for ( property in this.theme.sizes ) {
		value = this.theme.sizes[ property ] ;
		varName = '--' + camel.camelCaseToDash( property ) + '-size' ;
		defStr += '\t' + varName + ': ' + value + ';\n' ;
	}

	for ( property in this.theme.printSizes ) {
		value = this.theme.printSizes[ property ] ;
		varName = '--' + camel.camelCaseToDash( property ) + '-printsize' ;
		defStr += '\t' + varName + ': ' + value + ';\n' ;
	}

	defStr += '}\n\n' ;

	return defStr ;
} ;



HtmlRenderer.prototype.generateThemeOtherCss = function( scope ) {
	var defStr , cname , property , varName , value ;

	defStr = scope + ' {\n' ;

	for ( property in this.theme.fonts ) {
		value = this.theme.fonts[ property ] ;
		varName = '--' + camel.camelCaseToDash( property ) + '-font' ;
		defStr += '\t' + varName + ': ' + value + ';\n' ;
	}

	defStr += '}\n\n' ;

	return defStr ;
} ;



// Helpers



HtmlRenderer.prototype.styleToClasses = function( style , classes = new Set() ) {
	if ( style.bold ) { classes.add( 'bold' ) ; }
	if ( style.italic ) { classes.add( 'italic' ) ; }
	if ( style.underline ) { classes.add( 'underline' ) ; }

	if ( style.textColor ) {
		let cname = style.textColor.cname() ;
		classes.add( 'text-styled' ) ;
		classes.add( 'text-' + cname ) ;
		if ( ! this.colors[ cname ] ) { this.colors[ cname ] = style.textColor ; }
	}

	if ( style.backgroundColor ) {
		let cname = style.backgroundColor.cname() ;
		classes.add( 'bg-styled' ) ;
		classes.add( 'bg-' + cname ) ;
		if ( ! this.colors[ cname ] ) { this.colors[ cname ] = style.backgroundColor ; }
	}

	return classes ;
} ;



// Transform a Set into a class attribute string
HtmlRenderer.prototype.setToClassAttr = function( classes ) {
	var str = '' ;

	for ( let className of classes ) {
		if ( ! str ) { str = className ; }
		else { str += ' ' + className ; }
	}

	return str ;
} ;



HtmlRenderer.prototype.toTextNode = function( text ) {
	return escape.html( text || '' ).replace( /\n/g , '<br />' ) ;
} ;



HtmlRenderer.prototype.toAttrNode = function( text ) {
	return escape.htmlAttr( text || '' ) ;
} ;

