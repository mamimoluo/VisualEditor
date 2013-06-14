/*!
 * VisualEditor DataModel example data sets.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * @class
 * @singleton
 * @ignore
 */
ve.dm.example = {};

/* Methods */

/**
 * Convert arrays of shorthand annotations in a data fragment to AnnotationSets with real
 * annotation objects, and wraps the result in a ve.dm.ElementLinearData object.
 *
 * Shorthand notation for annotations is:
 * [ 'a', [ { 'type': 'link', 'attributes': { 'href': '...' } ] ]
 *
 * The actual storage format has an instance of ve.dm.LinkAnnotation instead of the plain object,
 * and an instance of ve.dm.AnnotationSet instead of the array.
 *
 * @method
 * @param {Array} data Linear model data
 * @param {ve.dm.IndexValueStore} [store] Index-value store to use, creates one if undefined
 * @returns {ve.dm.ElementLinearData} Element linear data store
 * @throws {Error} Example data passed to preprocessAnnotations by reference
 */
ve.dm.example.preprocessAnnotations = function ( data, store ) {
	var i, key;

	// Sanity check to make sure ve.dm.example data has not been passed in
	// by reference. Always use ve.copyArray.
	for ( i in ve.dm.example ) {
		if ( data === ve.dm.example[i] ) {
			throw new Error( 'Example data passed to preprocessAnnotations by reference' );
		}
	}

	store = store || new ve.dm.IndexValueStore();
	for ( i = 0; i < data.length; i++ ) {
		key = data[i].annotations ? 'annotations' : 1;
		// check for shorthand annotation objects in array
		if ( ve.isArray( data[i][key] ) && data[i][key][0].type ) {
			data[i][key] = ve.dm.example.createAnnotationSet( store, data[i][key] ).getIndexes();
		}
	}
	return new ve.dm.ElementLinearData( store, data );
};

/**
 * Create an annotation object from shorthand notation.
 * @method
 * @param {Object} annotation Plain object with type and attributes properties
 * @returns {ve.dm.Annotation} Instance of the right ve.dm.Annotation subclass
 */
ve.dm.example.createAnnotation = function ( annotation ) {
	return ve.dm.annotationFactory.create( annotation.type, annotation );
};

/**
 * Create an AnnotationSet from an array of shorthand annotations.
 *
 * This calls ve.dm.example.createAnnotation() for each element and puts the result in an
 * AnnotationSet.
 *
 * @method
 * @param {Array} annotations Array of annotations in shorthand format
 * @returns {ve.dm.AnnotationSet}
 */
ve.dm.example.createAnnotationSet = function ( store, annotations ) {
	var i;
	for ( i = 0; i < annotations.length; i++ ) {
		annotations[i] = ve.dm.example.createAnnotation( annotations[i] );
	}
	return new ve.dm.AnnotationSet( store, store.indexes( annotations ) );
};

/* Some common annotations in shorthand format */
ve.dm.example.bold = { 'type': 'textStyle/bold' };
ve.dm.example.italic = { 'type': 'textStyle/italic' };
ve.dm.example.underline = { 'type': 'textStyle/underline' };
ve.dm.example.span = { 'type': 'textStyle/span' };

/**
 * Creates a document from example data.
 *
 * Defaults to ve.dm.example.data if no name is supplied.
 *
 * @param {string} [name='data'] Named element of ve.dm.example
 * @param {ve.dm.IndexValueStore} [store] A specific index-value store to use, optionally.
 * @returns {ve.dm.Document} Document
 * @throws {Error} Example data not found
 */
ve.dm.example.createExampleDocument = function ( name, store ) {
	var doc, i;
	name = name || 'data';
	store = store || new ve.dm.IndexValueStore();
	if ( ve.dm.example[name] === undefined ) {
		throw new Error( 'Example data \'' + name + '\' not found' );
	}
	doc = new ve.dm.Document(
		ve.dm.example.preprocessAnnotations( ve.copyArray( ve.dm.example[name] ), store )
	);
	// HACK internalList isn't populated when creating a document from data
	if ( ve.dm.example[name].internalItems ) {
		for ( i = 0; i < ve.dm.example[name].internalItems.length; i++ ) {
			doc.internalList.queueItemHtml(
				ve.dm.example[name].internalItems[i].key,
				ve.dm.example[name].internalItems[i].body
			);
		}
	}
	return doc;
};

/**
 * Looks up a value in a node tree.
 *
 * @method
 * @param {ve.Node} root Root node to lookup from
 * @param {number...} [paths] Index path
 * @returns {ve.Node} Node at given path
 */
ve.dm.example.lookupNode = function ( root ) {
	var i,
		node = root;
	for ( i = 1; i < arguments.length; i++ ) {
		node = node.children[arguments[i]];
	}
	return node;
};

ve.dm.example.createDomElement = function ( type, attributes ) {
	var key,
		element = document.createElement( type );
	for ( key in attributes ) {
		element.setAttribute( key, attributes[key] );
	}
	return element;
};

ve.dm.example.testDir = window.mw ?
	( window.mw.config.get( 'wgExtensionAssetsPath' ) + '/VisualEditor/modules/ve/test' ) :
	'.';

ve.dm.example.imgSrc = ve.dm.example.testDir + '/example.png';

/**
 * Serialized HTML.
 *
 * This is what the parser will emit.
 * TODO remove some of the <p>s here to test automatic wrapping
 */
ve.dm.example.html =
	'<h1>a<b>b</b><i>c</i></h1>' +
	'<table>' +
		'<tr>' +
			'<td>' +
				'<p>d</p>' +
				'<ul>' +
					'<li>' +
						'<p>e</p>' +
						'<ul>' +
							'<li>' +
								'<p>f</p>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>' +
				'<ol>' +
					'<li>' +
						'<p>g</p>' +
					'</li>' +
				'</ol>' +
			'</td>' +
		'</tr>' +
	'</table>' +
	'<pre>h<img src="' + ve.dm.example.imgSrc + '">i</pre>'+
	'<dl>' +
		'<dt>' +
			'<p>j</p>' +
		'</dt>' +
		'<dd>' +
			'<p>k</p>' +
		'</dd>' +
	'</dl>' +
	'<p>l</p>' +
	'<p>m</p>';

/*
 * Linear data.
 *
 * This is what we convert serialized HTML from the parser into so we can work with it more easily.
 *
 * There are three types of components in content data:
 *
 *     {string} Plain text character
 *
 *     {Array} Annotated character
 *         0: {string} Character
 *         1: {Object} List of references to immutable annotation objects, keyed by JSON
 *            serializations of their values (hashes)
 *
 *     {Object} Opening or closing structural element
 *         type: {string} Symbolic node type name, if closing element first character will be "/"
 *         [attributes]: {Object} List of symbolic attribute name and literal value pairs
 */
ve.dm.example.data = [
	//  0 - Beginning of heading
	{ 'type': 'heading', 'attributes': { 'level': 1 } },
	//  1 - Plain "a"
	'a',
	//  2 - Bold "b"
	['b', [ ve.dm.example.bold ]],
	//  3 - Italic "c"
	['c', [ ve.dm.example.italic ]],
	//  4 - End of heading
	{ 'type': '/heading' },
	//  5 - Beginning of table
	{ 'type': 'table' },
	//  6 - Beginning of body
	{ 'type': 'tableSection', 'attributes': { 'style': 'body' } },
	//  7 - Beginning of row
	{ 'type': 'tableRow' },
	//  8 - Beginning of cell
	{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
	//  9 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 10 - Plain "d"
	'd',
	// 11 - End of paragraph
	{ 'type': '/paragraph' },
	// 12 - Beginning of bullet list
	{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
	// 13 - Beginning of list item
	{ 'type': 'listItem' },
	// 14 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 15 - Plain "e"
	'e',
	// 16 - End of paragraph
	{ 'type': '/paragraph' },
	// 17 - Beginning of nested bullet list
	{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
	// 18 - Beginning of nested bullet list item
	{ 'type': 'listItem' },
	// 19 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 20 - Plain "f"
	'f',
	// 21 - End of paragraph
	{ 'type': '/paragraph' },
	// 22 - End of nested bullet list item
	{ 'type': '/listItem' },
	// 23 - End of nested bullet list
	{ 'type': '/list' },
	// 24 - End of bullet list item
	{ 'type': '/listItem' },
	// 25 - End of bullet list
	{ 'type': '/list' },
	// 26 - Beginning of numbered list
	{ 'type': 'list', 'attributes': { 'style': 'number' } },
	// 27 - Beginning of numbered list item
	{ 'type': 'listItem' },
	// 28 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 29 - Plain "g"
	'g',
	// 30 - End of paragraph
	{ 'type': '/paragraph' },
	// 31 - End of item
	{ 'type': '/listItem' },
	// 32 - End of lis t
	{ 'type': '/list' },
	// 33 - End of cell
	{ 'type': '/tableCell' },
	// 34 - End of row
	{ 'type': '/tableRow' },
	// 35 - End of body
	{ 'type': '/tableSection' },
	// 36 - End of table
	{ 'type': '/table' },
	// 37 - Beginning of preformatted
	{ 'type': 'preformatted' },
	// 38 - Plain "h"
	'h',
	// 39 - Beginning of inline image
	{
		'type': 'image',
		'attributes': {
			'src': ve.dm.example.imgSrc,
			'width': null,
			'height': null
		},
		'htmlAttributes': [ { 'values': { 'src': ve.dm.example.imgSrc } } ]
	},
	// 40 - End of inline image
	{ 'type': '/image' },
	// 41 - Plain "i"
	'i',
	// 42 - End of preformatted
	{ 'type': '/preformatted' },
	// 43 - Beginning of definition list
	{ 'type': 'definitionList' },
	// 44 - Beginning of definition list term item
	{ 'type': 'definitionListItem', 'attributes': { 'style': 'term' } },
	// 45 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 46 - Plain "j"
	'j',
	// 47 - End of paragraph
	{ 'type': '/paragraph' },
	// 48 - End of definition list term item
	{ 'type': '/definitionListItem' },
	// 49 - Beginning of definition list definition item
	{ 'type': 'definitionListItem', 'attributes': { 'style': 'definition' } },
	// 50 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 51 - Plain "k"
	'k',
	// 52 - End of paragraph
	{ 'type': '/paragraph' },
	// 53 - End of definition list definition item
	{ 'type': '/definitionListItem' },
	// 54 - End of definition list
	{ 'type': '/definitionList' },
	// 55 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 56 - Plain "l"
	'l',
	// 57 - End of paragraph
	{ 'type': '/paragraph' },
	// 58 - Beginning of paragraph
	{ 'type': 'paragraph' },
	// 59 - Plain "m"
	'm',
	// 60 - End of paragraph
	{ 'type': '/paragraph' },
	// 61 - Beginning of internalList
	{ 'type': 'internalList' },
	// 62 - End of internalList
	{ 'type': '/internalList' }
	// 63 - End of document
];

ve.dm.example.alienData = [
	// 0 - Open alienBlock
	{ 'type': 'alienBlock' },
	// 1 - Close alienBlock
	{ 'type': '/alienBlock' },
	// 2 - Open paragraph
	{ 'type': 'paragraph' },
	// 3 - Plain character 'a'
	'a',
	// 4 - Open alienInline
	{ 'type': 'alienBlock' },
	// 5 - Close alienInline
	{ 'type': '/alienBlock' },
	// 6 - Plain character 'b'
	'b',
	// 7 - Close paragraph
	{ 'type': '/paragraph' },
	// 8 - Open alienBlock
	{ 'type': 'alienBlock' },
	// 9 - Close alienBlock
	{ 'type': '/alienBlock' },
	// 10 - Beginning of internalList
	{ 'type': 'internalList' },
	// 11 - End of internalList
	{ 'type': '/internalList' }
	// 12 - End of document
];

ve.dm.example.internalData = [
	{ 'type': 'paragraph' },
	'F', 'o', 'o',
	{ 'type': '/paragraph' },
	{ 'type': 'internalList' },
	{ 'type': 'internalItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'B', 'a', 'r',
	{ 'type': '/paragraph' },
	{ 'type': '/internalItem' },
	{ 'type': 'internalItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'B', 'a', 'z',
	{ 'type': '/paragraph' },
	{ 'type': '/internalItem' },
	{ 'type': '/internalList' },
	{ 'type': 'paragraph' },
	'Q', 'u', 'u', 'x',
	{ 'type': '/paragraph' }
];

ve.dm.example.internalData.internalItems = [
	{ 'key': 'bar', 'body': 'Bar' },
	{ 'key': 'baz', 'body': 'Baz' }
];

ve.dm.example.withMeta = [
	{
		'type': 'alienMeta',
		'attributes': {
			'domElements': $( '<!-- No content conversion -->' ).get()
		}
	},
	{ 'type': '/alienMeta' },
	{
		'type': 'mwAlienMeta',
		'attributes': {
			'domElements': $( '<meta property="mw:PageProp/nocc" />' ).get()
		}
	},
	{ 'type': '/mwAlienMeta' },
	{ 'type': 'paragraph' },
	'F',
	'o',
	'o',
	{
		'type': 'mwCategory',
		'attributes': {
			'hrefPrefix': './',
			'category': 'Category:Bar',
			'origCategory': 'Category:Bar',
			'sortkey': '',
			'origSortkey': ''
		},
		'htmlAttributes': [ { 'values': { 'rel': 'mw:WikiLink/Category', 'href': './Category:Bar' } } ]
	},
	{ 'type': '/mwCategory' },
	'B',
	'a',
	'r',
	{
		'type': 'mwAlienMeta',
		'attributes': {
			'domElements': $( '<meta property="mw:foo" content="bar" />' ).get()
		}
	},
	{ 'type': '/mwAlienMeta' },
	'B',
	'a',
	{
		'type': 'alienMeta',
		'attributes': {
			'domElements': $( '<!-- inline -->' ).get()
		}
	},
	{ 'type': '/alienMeta' },
	'z',
	{ 'type': '/paragraph' },
	{
		'type': 'mwAlienMeta',
		'attributes': {
			'domElements': $( '<meta property="mw:bar" content="baz" />' ).get()
		}
	},
	{ 'type': '/mwAlienMeta' },
	{
		'type': 'alienMeta',
		'attributes': {
			'domElements': $( '<!--barbaz-->' ).get()
		}
	},
	{ 'type': '/alienMeta' },
	{
		'type': 'mwCategory',
		'attributes': {
			'hrefPrefix': './',
			'category': 'Category:Foo foo',
			'origCategory': 'Category:Foo_foo',
			'sortkey': 'Bar baz#quux',
			'origSortkey': 'Bar baz%23quux'
		},
		'htmlAttributes': [ { 'values':  {
			'rel': 'mw:WikiLink/Category',
			'href': './Category:Foo_foo#Bar baz%23quux'
		} } ]
	},
	{ 'type': '/mwCategory' },
	{
		'type': 'mwAlienMeta',
		'attributes': {
			'domElements': $( '<meta typeof="mw:Placeholder" data-parsoid="foobar" />' ).get()
		}
	},
	{ 'type': '/mwAlienMeta' },
	{ 'type': 'internalList' },
	{ 'type': '/internalList' }
];

ve.dm.example.withMetaPlainData = [
	{ 'type': 'paragraph' },
	'F',
	'o',
	'o',
	'B',
	'a',
	'r',
	'B',
	'a',
	'z',
	{ 'type': '/paragraph' },
	{ 'type': 'internalList' },
	{ 'type': '/internalList' }
];

ve.dm.example.withMetaMetaData = [
	[
		{
			'type': 'alienMeta',
			'attributes': {
				'domElements': $( '<!-- No content conversion -->' ).get()
			}
		},
		{
			'type': 'mwAlienMeta',
			'attributes': {
				'domElements': $( '<meta property="mw:PageProp/nocc" />' ).get()
			}
		}
	],
	undefined,
	undefined,
	undefined,
	[
		{
			'type': 'mwCategory',
			'attributes': {
				'hrefPrefix': './',
				'category': 'Category:Bar',
				'origCategory': 'Category:Bar',
				'sortkey': '',
				'origSortkey': ''
			},
			'htmlAttributes': [ { 'values': { 'rel': 'mw:WikiLink/Category', 'href': './Category:Bar' } } ]
		}
	],
	undefined,
	undefined,
	[
		{
			'type': 'mwAlienMeta',
			'attributes': {
				'domElements': $( '<meta property="mw:foo" content="bar" />' ).get()
			}
		}
	],
	undefined,
	[
		{
			'type': 'alienMeta',
			'attributes': {
				'domElements': $( '<!-- inline -->' ).get()
			}
		}
	],
	undefined,
	[
		{
			'type': 'mwAlienMeta',
			'attributes': {
				'domElements': $( '<meta property="mw:bar" content="baz" />' ).get()
			}
		},
		{
			'type': 'alienMeta',
			'attributes': {
				'domElements': $( '<!--barbaz-->' ).get()
			}
		},
		{
			'type': 'mwCategory',
			'attributes': {
				'hrefPrefix': './',
				'category': 'Category:Foo foo',
				'origCategory': 'Category:Foo_foo',
				'sortkey': 'Bar baz#quux',
				'origSortkey': 'Bar baz%23quux'
			},
			'htmlAttributes': [ { 'values': {
				'rel': 'mw:WikiLink/Category',
				'href': './Category:Foo_foo#Bar baz%23quux'
			} } ]
		},
		{
			'type': 'mwAlienMeta',
			'attributes': {
				'domElements': $( '<meta typeof="mw:Placeholder" data-parsoid="foobar" />' ).get()
			}
		}
	],
	undefined,
	undefined
];

ve.dm.example.complexTableHtml = '<table><caption>Foo</caption><thead><tr><th>Bar</th></tr></thead>' +
	'<tfoot><tr><td>Baz</td></tr></tfoot><tbody><tr><td>Quux</td><td>Whee</td></tr></tbody></table>';

ve.dm.example.complexTable = [
	{ 'type': 'table' },
	{ 'type': 'tableCaption' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'F',
	'o',
	'o',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCaption' },
	{ 'type': 'tableSection', 'attributes': { 'style': 'header' } },
	{ 'type': 'tableRow' },
	{ 'type': 'tableCell', 'attributes': { 'style': 'header' } },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'B',
	'a',
	'r',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCell' },
	{ 'type': '/tableRow' },
	{ 'type': '/tableSection' },
	{ 'type': 'tableSection', 'attributes': { 'style': 'footer' } },
	{ 'type': 'tableRow' },
	{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'B',
	'a',
	'z',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCell' },
	{ 'type': '/tableRow' },
	{ 'type': '/tableSection' },
	{ 'type': 'tableSection', 'attributes': { 'style': 'body' } },
	{ 'type': 'tableRow' },
	{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'Q',
	'u',
	'u',
	'x',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCell' },
	{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'W',
	'h',
	'e',
	'e',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCell' },
	{ 'type': '/tableRow' },
	{ 'type': '/tableSection' },
	{ 'type': '/table' },
	{ 'type': 'internalList' },
	{ 'type': '/internalList' }
];

ve.dm.example.inlineAtEdges = [
	{ 'type': 'paragraph' },
	{
		'type': 'image',
		'attributes': {
			'src': ve.dm.example.imgSrc,
			'width': null,
			'height': null
		},
		'htmlAttributes': [ { 'values': { 'src': ve.dm.example.imgSrc } } ]
	},
	{ 'type': '/image' },
	'F',
	'o',
	'o',
	{ 'type': 'alienInline', 'attributes': { 'domElements': $( '<foobar />' ).get() } },
	{ 'type': '/alienInline' },
	{ 'type': '/paragraph' }
];

ve.dm.example.emptyBranch = [
	{ 'type': 'table' },
	{ 'type': '/table' }
];

/**
 * Sample content data index.
 *
 * This is part of what a ve.dm.DocumentFragment generates when given linear data.
 *
 *  (21) branch nodes
 *     (01) document node
 *     (01) heading node
 *     (01) table node
 *     (01) tableRow node
 *     (01) tableCell node
 *     (06) paragraph nodes
 *     (03) list nodes
 *     (03) listItem nodes
 *     (01) preformatted node
 *     (01) definitionList node
 *     (02) definitionListItem nodes
 *  (10) leaf nodes
 *     (09) text nodes
 *     (01) image node
 */
ve.dm.example.tree = new ve.dm.DocumentNode( [
	// Heading with "abc"
	new ve.dm.HeadingNode( [new ve.dm.TextNode( 3 )], ve.dm.example.data[0] ),
	new ve.dm.TableNode( [
		new ve.dm.TableSectionNode( [
			new ve.dm.TableRowNode( [
				new ve.dm.TableCellNode( [
					// Paragraph with "d"
					new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )],
						ve.dm.example.data[9] ),
					new ve.dm.ListNode( [
						// 1st level bullet list item with "e"
						new ve.dm.ListItemNode( [
							new ve.dm.ParagraphNode(
								[new ve.dm.TextNode( 1 )],
								ve.dm.example.data[14]
							),
							new ve.dm.ListNode( [
								// 2nd level bullet list item with "f"
								new ve.dm.ListItemNode( [
									new ve.dm.ParagraphNode(
										[new ve.dm.TextNode( 1 )],
										ve.dm.example.data[19]
									)
								], ve.dm.example.data[18] )
							], ve.dm.example.data[17] )
						], ve.dm.example.data[13] )
					], ve.dm.example.data[12] ),
					new ve.dm.ListNode( [
						// Numbered list item with "g"
						new ve.dm.ListItemNode( [
							new ve.dm.ParagraphNode(
								[new ve.dm.TextNode( 1 )],
								ve.dm.example.data[28]
							)
						], ve.dm.example.data[27] )
					], ve.dm.example.data[26] )
				], ve.dm.example.data[8] )
			], ve.dm.example.data[7] )
		], ve.dm.example.data[6] )
	], ve.dm.example.data[5] ),
	// Preformatted with "h[example.png]i"
	new ve.dm.PreformattedNode( [
		new ve.dm.TextNode( 1 ),
		new ve.dm.ImageNode( [], ve.dm.example.data[39] ),
		new ve.dm.TextNode( 1 )
	], ve.dm.example.data[37] ),
	new ve.dm.DefinitionListNode( [
		// Definition list term item with "j"
		new ve.dm.DefinitionListItemNode( [
			new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )], ve.dm.example.data[45] )
		], ve.dm.example.data[44] ),
		// Definition list definition item with "k"
		new ve.dm.DefinitionListItemNode( [
			new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )], ve.dm.example.data[50] )
		], ve.dm.example.data[49] )
	], ve.dm.example.data[43] ),
	new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )], ve.dm.example.data[55] ),
	new ve.dm.ParagraphNode( [new ve.dm.TextNode( 1 )], ve.dm.example.data[58] ),
	new ve.dm.InternalListNode( [], ve.dm.example.data[61] )
] );

ve.dm.example.conversions = {
	'definitionListItem term': {
		'domElement': ve.dm.example.createDomElement( 'dt' ),
		'dataElement': { 'type': 'definitionListItem', 'attributes': { 'style': 'term' } }
	},
	'definitionListItem definition': {
		'domElement': ve.dm.example.createDomElement( 'dd' ),
		'dataElement': { 'type': 'definitionListItem', 'attributes': { 'style': 'definition' } }
	},
	'definitionList definition': {
		'domElement': ve.dm.example.createDomElement( 'dl' ),
		'dataElement': { 'type': 'definitionList' }
	},
	'heading level 1': {
		'domElement': ve.dm.example.createDomElement( 'h1' ),
		'dataElement': { 'type': 'heading', 'attributes': { 'level': 1 } }
	},
	'heading level 2': {
		'domElement': ve.dm.example.createDomElement( 'h2' ),
		'dataElement': { 'type': 'heading', 'attributes': { 'level': 2 } }
	},
	'heading level 3': {
		'domElement': ve.dm.example.createDomElement( 'h3' ),
		'dataElement': { 'type': 'heading', 'attributes': { 'level': 3 } }
	},
	'heading level 4': {
		'domElement': ve.dm.example.createDomElement( 'h4' ),
		'dataElement': { 'type': 'heading', 'attributes': { 'level': 4 } }
	},
	'heading level 5': {
		'domElement': ve.dm.example.createDomElement( 'h5' ),
		'dataElement': { 'type': 'heading', 'attributes': { 'level': 5 } }
	},
	'heading level 6': {
		'domElement': ve.dm.example.createDomElement( 'h6' ),
		'dataElement': { 'type': 'heading', 'attributes': { 'level': 6 } }
	},
	'image': {
		'domElement': ve.dm.example.createDomElement( 'img' ),
		'dataElement': { 'type': 'image' }
	},
	'listItem': {
		'domElement': ve.dm.example.createDomElement( 'li' ),
		'dataElement': { 'type': 'listItem' }
	},
	'list bullet': {
		'domElement': ve.dm.example.createDomElement( 'ul' ),
		'dataElement': { 'type': 'list', 'attributes': { 'style': 'bullet' } }
	},
	'list number': {
		'domElement': ve.dm.example.createDomElement( 'ol' ),
		'dataElement': { 'type': 'list', 'attributes': { 'style': 'number' } }
	},
	'paragraph': {
		'domElement': ve.dm.example.createDomElement( 'p' ),
		'dataElement': { 'type': 'paragraph' }
	},
	'preformatted': {
		'domElement': ve.dm.example.createDomElement( 'pre' ),
		'dataElement': { 'type': 'preformatted' }
	},
	'tableCell': {
		'domElement': ve.dm.example.createDomElement( 'td' ),
		'dataElement': { 'type': 'tableCell', 'attributes': { 'style': 'data' } }
	},
	'table': {
		'domElement': ve.dm.example.createDomElement( 'table' ),
		'dataElement': { 'type': 'table' }
	},
	'tableRow': {
		'domElement': ve.dm.example.createDomElement( 'tr' ),
		'dataElement': { 'type': 'tableRow' }
	},
	'paragraph with data-mw attribute': {
		'domElement': ve.dm.example.createDomElement( 'p', { 'data-mw': '{"test":1234}' } ),
		'dataElement': {
			'type': 'paragraph',
			'htmlAttributes': [ { 'values': { 'data-mw': '{"test":1234}' } } ]
		}
	},
	'paragraph with style attribute': {
		'domElement': ve.dm.example.createDomElement( 'p', { 'style': 'color:blue' } ),
		'dataElement': {
			'type': 'paragraph',
			'htmlAttributes': [ { 'values': { 'style': 'color:blue' } } ]
		}
	}
};

ve.dm.example.MWInlineImageHtml = '<span typeof="mw:Image" data-parsoid="{&quot;tsr&quot;:[0,24],&quot;optList&quot;:[{&quot;ck&quot;:&quot;width&quot;,&quot;ak&quot;:&quot;500px&quot;}],&quot;cacheKey&quot;:&quot;[[Image:Wiki.png|500px]]&quot;,&quot;img&quot;:{&quot;h&quot;:155,&quot;w&quot;:135,&quot;wdset&quot;:true},&quot;dsr&quot;:[0,24,null,null]}"><a href="./File:Wiki.png" data-parsoid="{&quot;a&quot;:{&quot;href&quot;:&quot;./File:Wiki.png&quot;}}"><img resource="./File:Wiki.png" src="http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png" height="155" width="135" data-parsoid="{&quot;a&quot;:{&quot;resource&quot;:&quot;./File:Wiki.png&quot;,&quot;width&quot;:&quot;135&quot;},&quot;sa&quot;:{&quot;resource&quot;:&quot;Image:Wiki.png&quot;,&quot;width&quot;:&quot;500&quot;}}"></a></span>';
ve.dm.example.MWTransclusion = {
	'blockSpan':         '<span about="#mwt1" typeof="mw:Transclusion" data-mw="{&quot;id&quot;:&quot;mwt1&quot;,&quot;target&quot;:{&quot;wt&quot;:&quot;Test&quot;},&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;Hello, world!&quot;}}}" data-parsoid="{&quot;tsr&quot;:[18,40],&quot;src&quot;:&quot;{{Test|Hello, world!}}&quot;,&quot;dsr&quot;:[18,40,null,null]}"></span>',
	'blockSpanModified': '<span about="#mwt1" typeof="mw:Transclusion" data-mw="{&quot;id&quot;:&quot;mwt1&quot;,&quot;target&quot;:{&quot;wt&quot;:&quot;Test&quot;},&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;Hello, globe!&quot;}}}" data-parsoid="{&quot;tsr&quot;:[18,40],&quot;src&quot;:&quot;{{Test|Hello, world!}}&quot;,&quot;dsr&quot;:[18,40,null,null]}"></span>',
	'blockContent': '<p about="#mwt1" data-parsoid="{}">Hello, world!</p>',
	'blockData': {
		'type': 'mwTransclusionBlock',
		'attributes': {
			'mw': {
				'id': 'mwt1',
				'target': { 'wt' : 'Test' },
				'params': {
					'1': { 'wt': 'Hello, world!' }
				}
			},
			'mwOriginal': {
				'id': 'mwt1',
				'target': { 'wt' : 'Test' },
				'params': {
					'1': { 'wt': 'Hello, world!' }
				}
			}
		},
		'htmlAttributes': [
			{ 'values': {
				'about': '#mwt1',
				'data-mw': '{\"id\":\"mwt1\",\"target\":{\"wt\":\"Test\"},\"params\":{\"1\":{\"wt\":\"Hello, world!\"}}}',
				'data-parsoid': '{\"tsr\":[18,40],\"src\":\"{{Test|Hello, world!}}\",\"dsr\":[18,40,null,null]}',
				'typeof': 'mw:Transclusion'
			} },
			{ 'values': {
				'about': '#mwt1',
				'data-parsoid': '{}'
			} }
		]
	},
	'inlineOpen':         '<span about="#mwt1" typeof="mw:Transclusion" data-mw="{&quot;id&quot;:&quot;mwt1&quot;,&quot;target&quot;:{&quot;wt&quot;:&quot;Inline&quot;},&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;1,234&quot;}}}" data-parsoid="{&quot;tsr&quot;:[18,34],&quot;src&quot;:&quot;{{Inline|1,234}}&quot;,&quot;dsr&quot;:[18,34,null,null]}">',
	'inlineOpenModified': '<span about="#mwt1" typeof="mw:Transclusion" data-mw="{&quot;id&quot;:&quot;mwt1&quot;,&quot;target&quot;:{&quot;wt&quot;:&quot;Inline&quot;},&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;5,678&quot;}}}" data-parsoid="{&quot;tsr&quot;:[18,34],&quot;src&quot;:&quot;{{Inline|1,234}}&quot;,&quot;dsr&quot;:[18,34,null,null]}">',
	'inlineContent': '$1,234.00',
	'inlineClose': '</span>',
	'inlineData': {
		'type': 'mwTransclusionInline',
		'attributes': {
			'mw': {
				'id': 'mwt1',
				'target': { 'wt' : 'Inline' },
				'params': {
					'1': { 'wt': '1,234' }
				}
			},
			'mwOriginal': {
				'id': 'mwt1',
				'target': { 'wt' : 'Inline' },
				'params': {
					'1': { 'wt': '1,234' }
				}
			}
		},
		'htmlAttributes': [ { 'values': {
			'about': '#mwt1',
			'data-mw': '{\"id\":\"mwt1\",\"target\":{\"wt\":\"Inline\"},\"params\":{\"1\":{\"wt\":\"1,234\"}}}',
			'data-parsoid': '{\"tsr\":[18,34],\"src\":\"{{Inline|1,234}}\",\"dsr\":[18,34,null,null]}',
			'typeof': 'mw:Transclusion'
		} } ]
	},
	'mixed': '<link about="#mwt1" rel="mw:WikiLink/Category" typeof="mw:Transclusion" data-mw="{&quot;id&quot;:&quot;mwt1&quot;,&quot;target&quot;:{&quot;wt&quot;:&quot;Inline&quot;},&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;5,678&quot;}}}"><span about="#mwt1">Foo</span>',
	'mixedDataOpen': {
		'type': 'mwTransclusionInline',
		'attributes': {
			'mw': {
				'id': 'mwt1',
				'target': { 'wt': 'Inline' },
				'params': {
					'1': { 'wt': '5,678' }
				}
			},
			'mwOriginal': {
				'id': 'mwt1',
				'target': { 'wt': 'Inline' },
				'params': {
					'1': { 'wt': '5,678' }
				}
			}
		},
		'htmlAttributes': [
			{ 'values': {
				'about': '#mwt1',
				'rel': 'mw:WikiLink/Category',
				'typeof': 'mw:Transclusion',
				'data-mw': '{\"id\":\"mwt1\",\"target\":{\"wt\":\"Inline\"},\"params\":{\"1\":{\"wt\":\"5,678\"}}}'
			} },
			{ 'values': { 'about': '#mwt1' } }
		]
	},
	'mixedDataClose' : { 'type': '/mwTransclusionInline' }
};

ve.dm.example.MWTransclusion.blockParamsHash = ve.getHash( ve.dm.MWTransclusionNode.static.getHashObject( ve.dm.example.MWTransclusion.blockData ) );
ve.dm.example.MWTransclusion.blockStoreItems = {
	'hash': ve.dm.example.MWTransclusion.blockParamsHash,
	'value': $( ve.dm.example.MWTransclusion.blockSpan + ve.dm.example.MWTransclusion.blockContent ).get()
};

ve.dm.example.MWTransclusion.inlineParamsHash = ve.getHash( ve.dm.MWTransclusionNode.static.getHashObject( ve.dm.example.MWTransclusion.inlineData ) );
ve.dm.example.MWTransclusion.inlineStoreItems = {
	'hash': ve.dm.example.MWTransclusion.inlineParamsHash,
	'value': $( ve.dm.example.MWTransclusion.inlineOpen + ve.dm.example.MWTransclusion.inlineContent + ve.dm.example.MWTransclusion.inlineClose ).get()
};

ve.dm.example.MWTransclusion.mixedParamsHash = ve.getHash( ve.dm.MWTransclusionNode.static.getHashObject( ve.dm.example.MWTransclusion.mixedDataOpen ) );
ve.dm.example.MWTransclusion.mixedStoreItems = {
	'hash': ve.dm.example.MWTransclusion.mixedParamsHash,
	'value': $( ve.dm.example.MWTransclusion.mixed ).get()
};

ve.dm.example.domToDataCases = {
	'paragraph with plain text': {
		'html': '<body><p>abc</p></body>',
		'data': [
			{ 'type': 'paragraph' },
			'a',
			'b',
			'c',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'annotated text with bold, italic, underline formatting': {
		'html': '<body><p><b>a</b><i>b</i><u>c</u></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			['a', [ ve.dm.example.bold ]],
			['b', [ ve.dm.example.italic ]],
			['c', [ ve.dm.example.underline ]],
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'image': {
		'html': '<body><img src="' + ve.dm.example.imgSrc + '"></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			{
				'type': 'image',
				'attributes' : {
					'width': null,
					'height': null,
					'src': ve.dm.example.imgSrc
				},
				'htmlAttributes': [ { 'values': { 'src': ve.dm.example.imgSrc } } ]
			},
			{ 'type' : '/image' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'mw:Image': {
		'html': '<body><p>' + ve.dm.example.MWInlineImageHtml + '</p></body>',
		'data': [
			{ 'type': 'paragraph' },
			{
				'type': 'mwInlineImage',
				'attributes': {
					'src': 'http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png',
					'href': './File:Wiki.png',
					'width': 135,
					'height': 155,
					'isLinked': true,
					'valign': 'default',
					'resource': './File:Wiki.png',
					'type': 'inline'
				},
				'htmlAttributes': [
					{
						'values': {
							'data-parsoid': '{\"tsr\":[0,24],\"optList\":[{\"ck\":\"width\",\"ak\":\"500px\"}],\"cacheKey\":\"[[Image:Wiki.png|500px]]\",\"img\":{\"h\":155,\"w\":135,\"wdset\":true},\"dsr\":[0,24,null,null]}'
						},
						'children': [
							{
								'values': {
									'data-parsoid': '{\"a\":{\"href\":\"./File:Wiki.png\"}}'
								},
								'children': [
									{
										'values': {
											'data-parsoid': '{\"a\":{\"resource\":\"./File:Wiki.png\",\"width\":\"135\"},\"sa\":{\"resource\":\"Image:Wiki.png\",\"width\":\"500\"}}'
										}
									}
								]
							}
						]
					}
				]
			},
			{ 'type': '/mwInlineImage' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'mw:Transclusion (block level)': {
		'html': '<body>' + ve.dm.example.MWTransclusion.blockSpan + ve.dm.example.MWTransclusion.blockContent + '</body>',
		'data': [
			ve.dm.example.MWTransclusion.blockData,
			{ 'type': '/mwTransclusionBlock' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		],
		'storeItems': [
			ve.dm.example.MWTransclusion.blockStoreItems
		],
		'normalizedHtml': ve.dm.example.MWTransclusion.blockSpan + ve.dm.example.MWTransclusion.blockContent
	},
	'mw:Transclusion (block level - modified)': {
		'html': '<body>' + ve.dm.example.MWTransclusion.blockSpan + ve.dm.example.MWTransclusion.blockContent + '</body>',
		'data': [
			ve.dm.example.MWTransclusion.blockData,
			{ 'type': '/mwTransclusionBlock' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		],
		'storeItems': [
			ve.dm.example.MWTransclusion.blockStoreItems
		],
		'modify': function ( data ) {
			data[0].attributes.mw.params['1'].wt = 'Hello, globe!';
		},
		'normalizedHtml': ve.dm.example.MWTransclusion.blockSpanModified
	},
	'mw:Transclusion (inline)': {
		'html': '<body>' + ve.dm.example.MWTransclusion.inlineOpen + ve.dm.example.MWTransclusion.inlineContent + ve.dm.example.MWTransclusion.inlineClose + '</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			ve.dm.example.MWTransclusion.inlineData,
			{ 'type': '/mwTransclusionInline' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		],
		'storeItems': [
			ve.dm.example.MWTransclusion.inlineStoreItems
		],
		'normalizedHtml': ve.dm.example.MWTransclusion.inlineOpen + ve.dm.example.MWTransclusion.inlineContent + ve.dm.example.MWTransclusion.inlineClose
	},
	'mw:Transclusion (inline - modified)': {
		'html': '<body>' + ve.dm.example.MWTransclusion.inlineOpen + ve.dm.example.MWTransclusion.inlineContent + ve.dm.example.MWTransclusion.inlineClose + '</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			ve.dm.example.MWTransclusion.inlineData,
			{ 'type': '/mwTransclusionInline' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		],
		'storeItems': [
			ve.dm.example.MWTransclusion.inlineStoreItems
		],
		'modify': function ( data ) {
			data[1].attributes.mw.params['1'].wt = '5,678';
		},
		'normalizedHtml': ve.dm.example.MWTransclusion.inlineOpenModified + ve.dm.example.MWTransclusion.inlineClose
	},
	'mw:Reference': {
		'html':
			'<body>' +
				'<p>Foo' +
					'<span id="cite_ref-bar-1-0" class="reference" about="#mwt5" typeof="mw:Extension/ref" ' +
						'data-parsoid="{}" ' +
						'data-mw="{&quot;body&quot;:{&quot;html&quot;:&quot;&quot;},&quot;attrs&quot;:{&quot;name&quot;:&quot;bar&quot;}}">' +
						'<a href="#cite_note-bar-1" data-parsoid="{}">[1]</a>' +
					'</span>' +
					' Baz' +
					'<span id="cite_ref-quux-2-0" class="reference" about="#mwt6" typeof="mw:Extension/ref" ' +
						'data-parsoid="{}" ' +
						'data-mw="{&quot;body&quot;:{&quot;html&quot;:&quot;Quux&quot;},&quot;attrs&quot;:{&quot;name&quot;:&quot;quux&quot;}}">' +
						'<a href="#cite_note-quux-2" data-parsoid="{}">[2]</a>' +
					'</span>' +
					' Whee' +
					'<span id="cite_ref-bar-1-1" class="reference" about="#mwt7" typeof="mw:Extension/ref" ' +
						'data-parsoid="{}" ' +
						'data-mw="{&quot;body&quot;:{&quot;html&quot;:&quot;Bar&quot;},&quot;attrs&quot;:{&quot;name&quot;:&quot;bar&quot;}}">' +
						'<a href="#cite_note-bar-1" data-parsoid="{}">[1]</a>' +
					'</span>' +
					' Yay' +
					'<span id="cite_ref-3-0" class="reference" about="#mwt8" typeof="mw:Extension/ref" ' +
						'data-parsoid="{}" ' +
						'data-mw="{&quot;body&quot;:{&quot;html&quot;:&quot;No name&quot;},&quot;attrs&quot;:{&quot;group&quot;:&quot;g1&quot;}}">' +
						'<a href="#cite_note-3" data-parsoid="{}">[3]</a>' +
					'</span>' +
				'</p>' +
				'<ol class="references" typeof="mw:Extension/references" ' +
					'data-mw="{&quot;name&quot;:&quot;references&quot;,&quot;attrs&quot;:{}}" ' +
					'data-parsoid="{}">' +
					'<li id="cite_note-quux-2"><a href="#cite_ref-quux-2-0">u2191</a>Quux</li>' +
				'</ol>' +
			'</body>',
		'data': [
			{ 'type': 'paragraph' },
			'F', 'o', 'o',
			{
				'type': 'mwReference',
				'attributes': {
					'about': '#mwt5',
					'listIndex': 0,
					'listGroup': 'mwReference/',
					'listKey': 'bar',
					'refGroup': '',
					'mw': { 'body': { 'html': '' }, 'attrs': { 'name': 'bar' } },
					'contentsUsed': false
				},
				'htmlAttributes': [
					{
						'values': {
							'about': '#mwt5',
							'class': 'reference',
							'data-mw': '{"body":{"html":""},"attrs":{"name":"bar"}}',
							'data-parsoid': '{}',
							'id': 'cite_ref-bar-1-0',
							'typeof': 'mw:Extension/ref'
						},
						'children': [
							{
								'values': {
									'href': '#cite_note-bar-1',
									'data-parsoid': '{}'
								}
							}
						]
					}
				]
			},
			{ 'type': '/mwReference' },
			' ', 'B', 'a', 'z',
			{
				'type': 'mwReference',
				'attributes': {
					'about': '#mwt6',
					'listIndex': 1,
					'listGroup': 'mwReference/',
					'listKey': 'quux',
					'refGroup': '',
					'mw': { 'body': { 'html': 'Quux' }, 'attrs': { 'name': 'quux' } },
					'contentsUsed': true
				},
				'htmlAttributes': [
					{
						'values': {
							'about': '#mwt6',
							'class': 'reference',
							'data-mw': '{"body":{"html":"Quux"},"attrs":{"name":"quux"}}',
							'data-parsoid': '{}',
							'id': 'cite_ref-quux-2-0',
							'typeof': 'mw:Extension/ref'
						},
						'children': [
							{
								'values': {
									'href': '#cite_note-quux-2',
									'data-parsoid': '{}'
								}
							}
						]
					}
				]
			},
			{ 'type': '/mwReference' },
			' ', 'W', 'h', 'e', 'e',
			{
				'type': 'mwReference',
				'attributes': {
					'about': '#mwt7',
					'listIndex': 0,
					'listGroup': 'mwReference/',
					'listKey': 'bar',
					'refGroup': '',
					'mw': { 'body': { 'html': 'Bar' }, 'attrs': { 'name': 'bar' } },
					'contentsUsed': true
				},
				'htmlAttributes': [
					{
						'values': {
							'about': '#mwt7',
							'class': 'reference',
							'data-mw': '{"body":{"html":"Bar"},"attrs":{"name":"bar"}}',
							'data-parsoid': '{}',
							'id': 'cite_ref-bar-1-1',
							'typeof': 'mw:Extension/ref'
						},
						'children': [
							{
								'values': {
									'href': '#cite_note-bar-1',
									'data-parsoid': '{}'
								}
							}
						]
					}
				]
			},
			{ 'type': '/mwReference' },
			' ', 'Y', 'a', 'y',
			{
				'type': 'mwReference',
				'attributes': {
					'about': '#mwt8',
					'listIndex': 2,
					'listGroup': 'mwReference/g1',
					'listKey': null,
					'refGroup': 'g1',
					'mw': { 'body': { 'html': 'No name' }, 'attrs': { 'group': 'g1' } },
					'contentsUsed': true
				},
				'htmlAttributes': [
					{
						'values': {
							'about': '#mwt8',
							'class': 'reference',
							'data-mw': '{"body":{"html":"No name"},"attrs":{"group":"g1"}}',
							'data-parsoid': '{}',
							'id': 'cite_ref-3-0',
							'typeof': 'mw:Extension/ref'
						},
						'children': [
							{
								'values': {
									'href': '#cite_note-3',
									'data-parsoid': '{}'
								}
							}
						]
					}
				]
			},
			{ 'type': '/mwReference' },
			{ 'type': '/paragraph' },
			{
				'type': 'mwReferenceList',
				'attributes': {
					'domElements': $(
						'<ol class="references" typeof="mw:Extension/references" '+
							'data-mw="{&quot;name&quot;:&quot;references&quot;,&quot;attrs&quot;:{}}" ' +
							'data-parsoid="{}">'+
							'<li id="cite_note-quux-2"><a href="#cite_ref-quux-2-0">u2191</a>Quux</li>' +
						'</ol>' ).get(),
					'listGroup': 'mwReference/'
				}
			},
			{ 'type': '/mwReferenceList' },
			{ 'type': 'internalList' },
			{ 'type': 'internalItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'B', 'a', 'r',
			{ 'type': '/paragraph' },
			{ 'type': '/internalItem' },
			{ 'type': 'internalItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'Q', 'u', 'u', 'x',
			{ 'type': '/paragraph' },
			{ 'type': '/internalItem' },
			{ 'type': 'internalItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'N', 'o', ' ', 'n', 'a', 'm', 'e',
			{ 'type': '/paragraph' },
			{ 'type': '/internalItem' },
			{ 'type': '/internalList' }
		],
		'normalizedHtml':
			'<p>Foo' +
				'<span id="cite_ref-bar-1-0" class="reference" about="#mwt5" typeof="mw:Extension/ref" ' +
					'data-parsoid="{}" ' +
					'data-mw="{&quot;body&quot;:{&quot;html&quot;:&quot;&quot;},&quot;attrs&quot;:{&quot;name&quot;:&quot;bar&quot;}}">' +
				'</span>' +
				' Baz' +
				'<span id="cite_ref-quux-2-0" class="reference" about="#mwt6" typeof="mw:Extension/ref" ' +
					'data-parsoid="{}" ' +
					'data-mw="{&quot;body&quot;:{&quot;html&quot;:&quot;Quux&quot;},&quot;attrs&quot;:{&quot;name&quot;:&quot;quux&quot;}}">' +
				'</span>' +
				' Whee' +
				'<span id="cite_ref-bar-1-1" class="reference" about="#mwt7" typeof="mw:Extension/ref" ' +
					'data-parsoid="{}" ' +
					'data-mw="{&quot;body&quot;:{&quot;html&quot;:&quot;Bar&quot;},&quot;attrs&quot;:{&quot;name&quot;:&quot;bar&quot;}}">' +
				'</span>' +
				' Yay' +
				'<span id="cite_ref-3-0" class="reference" about="#mwt8" typeof="mw:Extension/ref" ' +
					'data-parsoid="{}" ' +
					'data-mw="{&quot;body&quot;:{&quot;html&quot;:&quot;No name&quot;},&quot;attrs&quot;:{&quot;group&quot;:&quot;g1&quot;}}">' +
				'</span>' +
			'</p>' +
			'<ol class="references" typeof="mw:Extension/references" ' +
				'data-mw="{&quot;name&quot;:&quot;references&quot;,&quot;attrs&quot;:{}}" ' +
				'data-parsoid="{}">' +
				'<li id="cite_note-quux-2"><a href="#cite_ref-quux-2-0">u2191</a>Quux</li>' +
			'</ol>'
	},
	'paragraph with alienInline inside': {
		'html': '<body><p>a<tt class="foo">b</tt>c</p></body>',
		'data': [
			{ 'type': 'paragraph' },
			'a',
			{
				'type': 'alienInline',
				'attributes': { 'domElements': $( '<tt class="foo">b</tt>' ).get() }
			},
			{ 'type': '/alienInline' },
			'c',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'paragraphs with an alienBlock between them': {
		'html': '<body><p>abc</p><figure>abc</figure><p>def</p></body>',
		'data': [
			{ 'type': 'paragraph' },
			'a',
			'b',
			'c',
			{ 'type': '/paragraph' },
			{ 'type': 'alienBlock', 'attributes': { 'domElements': $( '<figure>abc</figure>' ).get() } },
			{ 'type': '/alienBlock' },
			{ 'type': 'paragraph' },
			'd',
			'e',
			'f',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'annotated inline nodes': {
		'html': '<body><p>a<b><tt class="foo">b</tt><i><span typeof="mw:Entity">c</span></i></b>' +
			'<i><br/>d</i>e</p></body>',
		'data': [
			{ 'type': 'paragraph' },
			'a',
			{
				'type': 'alienInline',
				'attributes': { 'domElements': $( '<tt class="foo">b</tt>' ).get() },
				'annotations': [ ve.dm.example.bold ]
			},
			{ 'type': '/alienInline' },
			{
				'type': 'mwEntity',
				'attributes': { 'character': 'c' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ],
				'annotations': [ ve.dm.example.bold, ve.dm.example.italic ]
			},
			{ 'type': '/mwEntity' },
			{
				'type': 'break',
				'annotations': [ ve.dm.example.italic ]
			},
			{ 'type': '/break' },
			['d', [ ve.dm.example.italic ]],
			'e',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'wrapping of bare content': {
		'html': '<body>abc</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'a',
			'b',
			'c',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'wrapping of bare content with inline node': {
		'html': '<body>1<br/>2</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'1',
			{ 'type': 'break' },
			{ 'type': '/break' },
			'2',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'wrapping of bare content starting with inline node': {
		'html': '<body><img src="' + ve.dm.example.imgSrc + '">12</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			{
				'type': 'image',
				'attributes': {
					'src': ve.dm.example.imgSrc,
					'width': null,
					'height': null
				},
				'htmlAttributes': [ { 'values': { 'src': ve.dm.example.imgSrc } } ]
			},
			{ 'type': '/image' },
			'1',
			'2',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'wrapping of bare content with inline alien': {
		'html': '<body>1<tt class="bar">baz</tt>2</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'1',
			{
				'type': 'alienInline',
				'attributes': { 'domElements': $( '<tt class="bar">baz</tt>' ).get() }
			},
			{ 'type': '/alienInline' },
			'2',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'wrapping of bare content with block alien': {
		'html': '<body>1<figure class="bar">baz</figure>2</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'1',
			{ 'type': '/paragraph' },
			{
				'type': 'alienBlock',
				'attributes': { 'domElements': $( '<figure class="bar">baz</figure>' ).get() }
			},
			{ 'type': '/alienBlock' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'2',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'wrapping of bare content with mw:unrecognized inline alien': {
		'html': '<body>1<span typeof="mw:Placeholder">baz</span>2</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'1',
			{
				'type': 'alienInline',
				'attributes': { 'domElements': $( '<span typeof="mw:Placeholder">baz</span>' ).get() }
			},
			{ 'type': '/alienInline' },
			'2',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'wrapping of bare content with mw:unrecognized block alien': {
		'html': '<body>1<div typeof="mw:Placeholder">baz</div>2</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'1',
			{ 'type': '/paragraph' },
			{
				'type': 'alienBlock',
				'attributes': { 'domElements': $( '<div typeof="mw:Placeholder">baz</div>' ).get() }
			},
			{ 'type': '/alienBlock' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'2',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'wrapping of bare content starting with mw:unrecognized inline alien': {
		'html': '<body><span typeof="mw:Placeholder">Foo</span>Bar</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			{
				'type': 'alienInline',
				'attributes': { 'domElements': $( '<span typeof="mw:Placeholder">Foo</span>' ).get() }
			},
			{ 'type': '/alienInline' },
			'B',
			'a',
			'r',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'wrapping of bare content ending with mw:unrecognized inline alien': {
		'html': '<body>Foo<span typeof="mw:Placeholder">Bar</span></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'F',
			'o',
			'o',
			{
				'type': 'alienInline',
				'attributes': { 'domElements': $( '<span typeof="mw:Placeholder">Bar</span>' ).get() }
			},
			{ 'type': '/alienInline' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'wrapping of bare content with about group': {
		'html': '<body>1<tt about="#mwt1">foo</tt><tt about="#mwt1">bar</tt>2</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'1',
			{
				'type': 'alienInline',
				'attributes': { 'domElements': $( '<tt about="#mwt1">foo</tt><tt about="#mwt1">bar</tt>' ).get() }
			},
			{ 'type': '/alienInline' },
			'2',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'wrapping of bare content between structural nodes': {
		'html': '<body><table></table>abc<table></table></body>',
		'data': [
			{ 'type': 'table' },
			{ 'type': '/table' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'a',
			'b',
			'c',
			{ 'type': '/paragraph' },
			{ 'type': 'table' },
			{ 'type': '/table' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'wrapping of bare content between paragraphs': {
		'html': '<body><p>abc</p>def<p></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			'a',
			'b',
			'c',
			{ 'type': '/paragraph' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'd',
			'e',
			'f',
			{ 'type': '/paragraph' },
			{ 'type': 'paragraph' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'wrapping prevents empty list items': {
		'html': '<body><ul><li></li></ul></body>',
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
			{ 'type': 'listItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'empty' } },
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'empty document': {
		'html': '',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'empty' } },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'empty document with content added by the editor': {
		'html': null,
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'empty' } },
			'F',
			'o',
			'o',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		],
		'normalizedHtml': '<body><p>Foo</p></body>'
	},
	'empty list item with content added by the editor': {
		'html': null,
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
			{ 'type': 'listItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'empty' } },
			'F',
			'o',
			'o',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		],
		'normalizedHtml': '<body><ul><li><p>Foo</p></li></ul></body>'
	},
	'example document': {
		'html': ve.dm.example.html,
		'data': ve.dm.example.data
	},
	'empty annotation': {
		'html': '<body><p>Foo<span id="anchorTarget"></span>Bar</p></body>',
		'data': [
			{ 'type': 'paragraph' },
			'F', 'o', 'o',
			{
				'type': 'alienMeta',
				'attributes': {
					'domElements': $( '<span id="anchorTarget"></span>' ).get()
				}
			},
			{ 'type': '/alienMeta' },
			'B', 'a', 'r',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'empty annotation in wrapper paragraph': {
		'html': '<body>Foo<span id="anchorTarget"></span>Bar</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'F', 'o', 'o',
			{
				'type': 'alienMeta',
				'attributes': {
					'domElements': $( '<span id="anchorTarget"></span>' ).get()
				}
			},
			{ 'type': '/alienMeta' },
			'B', 'a', 'r',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'list item with space followed by link': {
		'html': '<body><ul><li><p> <a rel="mw:WikiLink" href="Foo_bar" data-rt="{&quot;sHref&quot;:&quot;foo bar&quot;}">bar</a></p></li></ul></body>',
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
			{ 'type': 'listItem' },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ' ] } },
			[
				'b',
				[ {
					'type': 'link/mwInternal',
					'attributes': {
						'title': 'Foo bar',
						'origTitle': 'Foo_bar',
						'hrefPrefix': ''
					},
					'htmlAttributes': [ { 'values': {
						'data-rt': '{"sHref":"foo bar"}',
						'href': 'Foo_bar',
						'rel': 'mw:WikiLink'
					} } ]
				} ]
			],
			[
				'a',
				[ {
					'type': 'link/mwInternal',
					'attributes': {
						'title': 'Foo bar',
						'origTitle': 'Foo_bar',
						'hrefPrefix': ''
					},
					'htmlAttributes': [ { 'values': {
						'data-rt': '{"sHref":"foo bar"}',
						'href': 'Foo_bar',
						'rel': 'mw:WikiLink'
					} } ]
				} ]
			],
			[
				'r',
				[ {
					'type': 'link/mwInternal',
					'attributes': {
						'title': 'Foo bar',
						'origTitle': 'Foo_bar',
						'hrefPrefix': ''
					},
					'htmlAttributes': [ { 'values': {
						'data-rt': '{"sHref":"foo bar"}',
						'href': 'Foo_bar',
						'rel': 'mw:WikiLink'
					} } ]
				} ]
			],
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'internal link with ./ and ../': {
		'html': '<body><p><a rel="mw:WikiLink" href="./../../../Foo/Bar">Foo</a></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			[
				'F',
				[ {
					'type': 'link/mwInternal',
					'attributes': {
						'title': 'Foo/Bar',
						'origTitle': 'Foo/Bar',
						'hrefPrefix': './../../../'
					},
					'htmlAttributes': [ { 'values': {
						'href': './../../../Foo/Bar',
						'rel': 'mw:WikiLink'
					} } ]
				} ]
			],
			[
				'o',
				[ {
					'type': 'link/mwInternal',
					'attributes': {
						'title': 'Foo/Bar',
						'origTitle': 'Foo/Bar',
						'hrefPrefix': './../../../'
					},
					'htmlAttributes': [ { 'values': {
						'href': './../../../Foo/Bar',
						'rel': 'mw:WikiLink'
					} } ]
				} ]
			],
			[
				'o',
				[ {
					'type': 'link/mwInternal',
					'attributes': {
						'title': 'Foo/Bar',
						'origTitle': 'Foo/Bar',
						'hrefPrefix': './../../../'
					},
					'htmlAttributes': [ { 'values': {
						'href': './../../../Foo/Bar',
						'rel': 'mw:WikiLink'
					} } ]
				} ]
			],
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'numbered external link': {
		'html': '<body><p><a rel="mw:ExtLink/Numbered" href="http://www.mediawiki.org/">[1]</a></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			[
				'[',
				[ {
					'type': 'link/mwExternal',
					'attributes': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/Numbered'
					},
					'htmlAttributes': [ { 'values': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/Numbered'
					} } ]
				} ]
			],
			[
				'1',
				[ {
					'type': 'link/mwExternal',
					'attributes': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/Numbered'
					},
					'htmlAttributes': [ { 'values': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/Numbered'
					} } ]
				} ]
			],
			[
				']',
				[ {
					'type': 'link/mwExternal',
					'attributes': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/Numbered'
					},
					'htmlAttributes': [ { 'values': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/Numbered'
					} } ]
				} ]
			],
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'URL link': {
		'html': '<body><p><a rel="mw:ExtLink/URL" href="http://www.mediawiki.org/">mw</a></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			[
				'm',
				[ {
					'type': 'link/mwExternal',
					'attributes': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/URL'
					},
					'htmlAttributes': [ { 'values': {
						'rel': 'mw:ExtLink/URL',
						'href': 'http://www.mediawiki.org/'
					} } ]
				} ]
			],
			[
				'w',
				[ {
					'type': 'link/mwExternal',
					'attributes': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/URL'
					},
					'htmlAttributes': [ { 'values': {
						'rel': 'mw:ExtLink/URL',
						'href': 'http://www.mediawiki.org/'
					} } ]
				} ]
			],
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace between unwrapped inline nodes': {
		'html':
			'<body>' +
				'<span typeof="mw:Entity">c</span> <span typeof="mw:Entity">d</span>\n<span typeof="mw:Entity">e</span>' +
			'</body>',
		'data': [
			{
				'type': 'paragraph',
				'internal': {
					'generated': 'wrapper'
				}
			},
			{
				'type': 'mwEntity',
				'attributes': { 'character': 'c' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			' ',
			{
				'type': 'mwEntity',
				'attributes': { 'character': 'd' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			'\n',
			{
				'type': 'mwEntity',
				'attributes': { 'character': 'e' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation in headings': {
		'html': '<body><h2>Foo</h2><h2> Bar</h2><h2>Baz </h2><h2>  Quux   </h2></body>',
		'data': [
			{ 'type': 'heading', 'attributes': { 'level': 2 } },
			'F',
			'o',
			'o',
			{ 'type': '/heading' },
			{
				'type': 'heading',
				'attributes': { 'level': 2 },
				'internal': { 'whitespace': [ undefined, ' ' ] }
			},
			'B',
			'a',
			'r',
			{ 'type': '/heading' },
			{
				'type': 'heading',
				'attributes': { 'level': 2 },
				'internal': { 'whitespace': [ undefined, undefined, ' ' ] }
			},
			'B',
			'a',
			'z',
			{ 'type': '/heading' },
			{
				'type': 'heading',
				'attributes': { 'level': 2 },
				'internal': { 'whitespace': [ undefined, '  ', '   ' ] }
			},
			'Q',
			'u',
			'u',
			'x',
			{ 'type': '/heading' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation in list items': {
		'html': '<body><ul><li>Foo</li><li> Bar</li><li>Baz </li><li>  Quux   </li></ul></body>',
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
			{ 'type': 'listItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'F',
			'o',
			'o',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'internal': { 'whitespace': [ undefined, ' ' ]} },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ ' ' ], 'generated': 'wrapper' } },
			'B',
			'a',
			'r',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'internal': { 'whitespace': [ undefined, undefined, ' ' ] } },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, undefined, undefined, ' ' ], 'generated': 'wrapper' } },
			'B',
			'a',
			'z',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'internal': { 'whitespace': [ undefined, '  ', '   '] } },
			{
				'type': 'paragraph',
				'internal': { 'whitespace': [ '  ', undefined, undefined, '   ' ], 'generated': 'wrapper' }
			},
			'Q',
			'u',
			'u',
			'x',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation with annotations': {
		'html': '<body><p> <i>  Foo   </i>    </p></body>',
		'data': [
			{
				'type': 'paragraph',
				'internal': { 'whitespace': [ undefined, ' ', '    ' ] }
			},
			[ ' ', [ ve.dm.example.italic ] ],
			[ ' ', [ ve.dm.example.italic ] ],
			[ 'F', [ ve.dm.example.italic ] ],
			[ 'o', [ ve.dm.example.italic ] ],
			[ 'o', [ ve.dm.example.italic ] ],
			[ ' ', [ ve.dm.example.italic ] ],
			[ ' ', [ ve.dm.example.italic ] ],
			[ ' ', [ ve.dm.example.italic ] ],
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'outer whitespace preservation in a list with bare text and a wrapper paragraph': {
		'html': '<body>\n<ul>\n\n<li>\n\n\nBa re\n\n\n\n</li>\n\n\n\n\n<li>\t<p>\t\tP\t\t\t</p>\t\t\t\t</li>\t\n</ul>\t\n\t\n</body>',
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' }, 'internal': { 'whitespace': [ '\n', '\n\n', '\t\n', '\t\n\t\n' ] } },
			{ 'type': 'listItem', 'internal': { 'whitespace': [ '\n\n', '\n\n\n', '\n\n\n\n', '\n\n\n\n\n' ] } },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper', 'whitespace': [ '\n\n\n', undefined, undefined, '\n\n\n\n' ] } },
			'B',
			'a',
			' ',
			'r',
			'e',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'internal': { 'whitespace': [ '\n\n\n\n\n', '\t', '\t\t\t\t', '\t\n' ] } },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ '\t', '\t\t', '\t\t\t', '\t\t\t\t' ] } },
			'P',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'outer whitespace preservation in a list with bare text and a sublist': {
		'html': '<body><ul>\n<li>\n\nBa re\n\n\n<ul>\n\n\n\n<li> <p>  P   </p>    </li>\t</ul>\t\t</li>\t\t\t</ul></body>',
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' }, 'internal': { 'whitespace': [ undefined, '\n', '\t\t\t' ] } },
			{ 'type': 'listItem', 'internal': { 'whitespace': [ '\n', '\n\n', '\t\t', '\t\t\t' ] } },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper', 'whitespace': [ '\n\n', undefined, undefined, '\n\n\n' ] } },
			'B',
			'a',
			' ',
			'r',
			'e',
			{ 'type': '/paragraph' },
			{ 'type': 'list', 'attributes': { 'style': 'bullet' }, 'internal': { 'whitespace': [ '\n\n\n', '\n\n\n\n', '\t', '\t\t' ] } },
			{ 'type': 'listItem', 'internal': { 'whitespace': [ '\n\n\n\n', ' ', '    ', '\t' ] } },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ ' ', '  ', '   ', '    '] } },
			'P',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation leaves non-edge content whitespace alone': {
		'html': '<body><p> A  B   <b>    C\t</b>\t\tD\t\t\t</p>\nE\n\nF\n\n\n<b>\n\n\n\nG </b>  H   </body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ', '\t\t\t', '\n' ] } },
			'A',
			' ',
			' ',
			'B',
			' ',
			' ',
			' ',
			[ ' ', [ ve.dm.example.bold ] ],
			[ ' ', [ ve.dm.example.bold ] ],
			[ ' ', [ ve.dm.example.bold ] ],
			[ ' ', [ ve.dm.example.bold ] ],
			[ 'C', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold ] ],
			'\t',
			'\t',
			'D',
			{ 'type': '/paragraph' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper', 'whitespace': [ '\n', undefined, undefined, '   ' ] } },
			'E',
			'\n',
			'\n',
			'F',
			'\n',
			'\n',
			'\n',
			[ '\n', [ ve.dm.example.bold ] ],
			[ '\n', [ ve.dm.example.bold ] ],
			[ '\n', [ ve.dm.example.bold ] ],
			[ '\n', [ ve.dm.example.bold ] ],
			[ 'G', [ ve.dm.example.bold ] ],
			[ ' ', [ ve.dm.example.bold ] ],
			' ',
			' ',
			'H',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation with non-edge content whitespace with nested annotations': {
		'html': '<body><p> A  B   <b>    C\t<i>\t\tD\t\t\t</i>\t\t\t\tE\n</b>\n\nF\n\n\n</p></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ', '\n\n\n' ] } },
			'A',
			' ',
			' ',
			'B',
			' ',
			' ',
			' ',
			[ ' ', [ ve.dm.example.bold ] ],
			[ ' ', [ ve.dm.example.bold ] ],
			[ ' ', [ ve.dm.example.bold ] ],
			[ ' ', [ ve.dm.example.bold ] ],
			[ 'C', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ 'D', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold ] ],
			[ 'E', [ ve.dm.example.bold ] ],
			[ '\n', [ ve.dm.example.bold ] ],
			'\n',
			'\n',
			'F',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation with tightly nested annotations': {
		'html': '<body><p> A  B   <b><i>\t\tC\t\t\t</i></b>\n\nD\n\n\n</p></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ', '\n\n\n' ] } },
			'A',
			' ',
			' ',
			'B',
			' ',
			' ',
			' ',
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ 'C', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			'\n',
			'\n',
			'D',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation with nested annotations with whitespace on the left side': {
		'html': '<body><p> A  B   <b>\n\t<i>\t\tC\t\t\t</i></b>\n\nD\n\n\n</p></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ', '\n\n\n' ] } },
			'A',
			' ',
			' ',
			'B',
			' ',
			' ',
			' ',
			[ '\n', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ 'C', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			'\n',
			'\n',
			'D',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation with nested annotations with whitespace on the right side': {
		'html': '<body><p> A  B   <b><i>\t\tC\t\t\t</i>\n\t</b>\n\nD\n\n\n</p></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ', '\n\n\n' ] } },
			'A',
			' ',
			' ',
			'B',
			' ',
			' ',
			' ',
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ 'C', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\t', [ ve.dm.example.bold, ve.dm.example.italic ] ],
			[ '\n', [ ve.dm.example.bold ] ],
			[ '\t', [ ve.dm.example.bold ] ],
			'\n',
			'\n',
			'D',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation with aliens': {
		'html': '<body> <p typeof="mw:Placeholder">  <br>   </p>    <p>\tFoo\t\t<tt>\t\t\tBar\t\t\t\t</tt>\nBaz\n\n<span typeof="mw:Placeholder">\n\n\nQuux\n\n\n\n</span> \tWhee \n</p>\t\n<figure>\n\tYay \t </figure> \n </body>',
		'data': [
			{
				'type': 'alienBlock',
				'attributes': {
					'domElements': $( '<p typeof="mw:Placeholder">  <br>   </p>' ).get()
				},
				'internal': {
					'whitespace': [ ' ', undefined, undefined, '    ' ]
				}
			},
			{ 'type': '/alienBlock' },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ '    ', '\t', ' \n', '\t\n' ] } },
			'F',
			'o',
			'o',
			'\t',
			'\t',
			{ 'type': 'alienInline', 'attributes': { 'domElements': $( '<tt>\t\t\tBar\t\t\t\t</tt>' ).get() } },
			{ 'type': '/alienInline' },
			'\n',
			'B',
			'a',
			'z',
			'\n',
			'\n',
			{
				'type': 'alienInline',
				'attributes': {
					'domElements': $( '<span typeof="mw:Placeholder">\n\n\nQuux\n\n\n\n</span>' ).get()
				}
			},
			{ 'type': '/alienInline' },
			' ',
			'\t',
			'W',
			'h',
			'e',
			'e',
			{ 'type': '/paragraph' },
			{
				'type': 'alienBlock',
				'attributes': {
					'domElements': $( '<figure>\n\tYay \t </figure>' ).get()
				},
				'internal': {
					'whitespace': [ '\t\n', undefined, undefined, ' \n ' ]
				}
			},
			{ 'type': '/alienBlock' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation not triggered inside <pre>': {
		'html': '<body>\n<pre>\n\n\nFoo\n\n\nBar\n\n\n\n</pre>\n\n\n\n\n</body>',
		'data': [
			{ 'type': 'preformatted', 'internal': { 'whitespace': ['\n', undefined, undefined, '\n\n\n\n\n' ] } },
			'\n',
			'\n',
			'F',
			'o',
			'o',
			'\n',
			'\n',
			'\n',
			'B',
			'a',
			'r',
			'\n',
			'\n',
			'\n',
			'\n',
			{ 'type': '/preformatted' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation in table cell starting with text and ending with annotation': {
		'html': '<body><table><tbody><tr><td>Foo <b>Bar</b></td></tr></tbody></table></body>',
		'data': [
			{ 'type': 'table' },
			{ 'type': 'tableSection', 'attributes': { 'style': 'body' } },
			{ 'type': 'tableRow' },
			{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'F',
			'o',
			'o',
			' ',
			[ 'B', [ ve.dm.example.bold ] ],
			[ 'a', [ ve.dm.example.bold ] ],
			[ 'r', [ ve.dm.example.bold ] ],
			{ 'type': '/paragraph' },
			{ 'type': '/tableCell' },
			{ 'type': '/tableRow' },
			{ 'type': '/tableSection' },
			{ 'type': '/table' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation with wrapped text, comments and language links': {
		'html': '<body><!-- Foo --> <!-- Bar -->\nFoo\n' +
			'<link rel="mw:WikiLink/Language" href="http://de.wikipedia.org/wiki/Foo">\n' +
			'<link rel="mw:WikiLink/Language" href="http://fr.wikipedia.org/wiki/Foo"></body>',
		'data': [
			{
				'type': 'alienMeta',
				'internal': { 'whitespace': [ undefined, undefined, undefined, ' ' ] },
				'attributes': {
					'domElements': $( '<!-- Foo -->' ).get()
				}
			},
			{ 'type': '/alienMeta' },
			{
				'type': 'alienMeta',
				'internal': { 'whitespace': [ ' ', undefined, undefined, '\n' ] },
				'attributes': {
					'domElements': $( '<!-- Bar -->' ).get()
				}
			},
			{ 'type': '/alienMeta' },
			{
				'type': 'paragraph',
				'internal': {
					'generated': 'wrapper',
					'whitespace': [ '\n', undefined, undefined, '\n' ]
				}
			},
			'F',
			'o',
			'o',
			{ 'type': '/paragraph' },
			{
				'type': 'mwLanguage',
				'attributes': {
					'href': 'http://de.wikipedia.org/wiki/Foo'
				},
				'htmlAttributes': [ { 'values': {
					'href': 'http://de.wikipedia.org/wiki/Foo',
					'rel': 'mw:WikiLink/Language'
				} } ],
				'internal': { 'whitespace': [ '\n', undefined, undefined, '\n' ] }
			},
			{ 'type': '/mwLanguage' },
			{
				'type': 'mwLanguage',
				'attributes': {
					'href': 'http://fr.wikipedia.org/wiki/Foo'
				 },
				 'htmlAttributes': [ { 'values': {
					'href': 'http://fr.wikipedia.org/wiki/Foo',
					'rel': 'mw:WikiLink/Language'
				} } ],
				'internal': { 'whitespace': [ '\n' ] }
			},
			{ 'type': '/mwLanguage' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation with comments at end of wrapper paragraph': {
		'html': '<body><ul><li> bar<!-- baz -->quux </li></ul></body>',
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
			{
				'type': 'listItem',
				'internal': {
					'whitespace': [
						undefined,
						' ',
						' '
					]
				}
			},
			{
				'type': 'paragraph',
				'internal': {
					'generated': 'wrapper',
					'whitespace': [
						' ',
						undefined,
						undefined,
						' '
					]
				}
			},
			'b', 'a', 'r',
			{
				'type': 'alienMeta',
				'attributes': {
					'domElements': $( '<!-- baz -->' ).get()
				}
			},
			{ 'type': '/alienMeta' },
			'q', 'u', 'u', 'x',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation with comment at end of wrapper paragraph': {
		'html': '<body><ul><li> bar<!-- baz --> </li></ul></body>',
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
			{
				'type': 'listItem',
				'internal': {
					'whitespace': [
						undefined,
						' ',
						' '
					]
				}
			},
			{
				'type': 'paragraph',
				'internal': {
					'generated': 'wrapper',
					'whitespace': [
						' '
					]
				}
			},
			'b', 'a', 'r',
			{ 'type': '/paragraph' },
			{
				'type': 'alienMeta',
				'attributes': {
					'domElements': $( '<!-- baz -->' ).get()
				},
				'internal': {
					'whitespace': [
						undefined,
						undefined,
						undefined,
						' '
					]
				}
			},
			{ 'type': '/alienMeta' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation with multiple comments at end of wrapper paragraph': {
		'html': '<body><ul><li> foo <!-- bar --> <!-- baz --> </li></ul></body>',
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
			{
				'type': 'listItem',
				'internal': {
					'whitespace': [
						undefined,
						' ',
						' '
					]
				}
			},
			{
				'type': 'paragraph',
				'internal': {
					'generated': 'wrapper',
					'whitespace': [
						' ',
						undefined,
						undefined,
						' '
					]
				}
			},
			'f', 'o', 'o',
			{ 'type': '/paragraph' },
			{
				'type': 'alienMeta',
				'attributes': {
					'domElements': $( '<!-- bar -->' ).get()
				},
				'internal': {
					'whitespace': [
						' ',
						undefined,
						undefined,
						' '
					]
				}
			},
			{ 'type': '/alienMeta' },
			{
				'type': 'alienMeta',
				'attributes': {
					'domElements': $( '<!-- baz -->' ).get()
				},
				'internal': {
					'whitespace': [
						' ',
						undefined,
						undefined,
						' '
					]
				}
			},
			{ 'type': '/alienMeta' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation with comment at start or end of element': {
		'html': '<body><p> <!-- foo -->bar<!-- baz --> </p></body>',
		'data': [
			{
				'type': 'paragraph',
				'internal': {
					'whitespace': [
						undefined,
						' ',
						' '
					]
				}
			},
			{
				'type': 'alienMeta',
				'attributes': {
					'domElements': $( '<!-- foo -->' ).get()
				}
			},
			{ 'type': '/alienMeta' },
			'b', 'a', 'r',
			{
				'type': 'alienMeta',
				'attributes': {
					'domElements': $( '<!-- baz -->' ).get()
				}
			},
			{ 'type': '/alienMeta' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'mismatching whitespace data is ignored': {
		'html': null,
		'data': [
			{ 'type': 'list', 'attributes': { 'style': 'bullet' }, 'internal': { 'whitespace': [ ' ', '  ', '   ', '    ' ] } },
			{ 'type': 'listItem', 'internal': { 'whitespace': [ ' ', '  ', '   ', '    ' ] } },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ ' ', '\t', '\n', '  ' ] } },
			'A',
			{ 'type': '/paragraph' },
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ '  ' ] } },
			'B',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		],
		'normalizedHtml': '<body> <ul><li><p>\tA\n</p>  <p>B</p></li></ul>    </body>'
	},
	'order of nested annotations is preserved': {
		'html': '<body><p><b><a rel="mw:WikiLink" href="Foo"><i>Foo</i></a></b></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			[
				'F',
				[
					ve.dm.example.bold,
					{
						'type': 'link/mwInternal',
						'attributes': {
							'hrefPrefix': '',
							'origTitle': 'Foo',
							'title': 'Foo'
						},
						'htmlAttributes': [ { 'values': {
							'href': 'Foo',
							'rel': 'mw:WikiLink'
						} } ]
					},
					ve.dm.example.italic
				]
			],
			[
				'o',
				[
					ve.dm.example.bold,
					{
						'type': 'link/mwInternal',
						'attributes': {
							'hrefPrefix': '',
							'origTitle': 'Foo',
							'title': 'Foo'
						},
						'htmlAttributes': [ { 'values': {
							'href': 'Foo',
							'rel': 'mw:WikiLink'
						} } ]
					},
					ve.dm.example.italic
				]
			],
			[
				'o',
				[
					ve.dm.example.bold,
					{
						'type': 'link/mwInternal',
						'attributes': {
							'hrefPrefix': '',
							'origTitle': 'Foo',
							'title': 'Foo'
						},
						'htmlAttributes': [ { 'values': {
							'href': 'Foo',
							'rel': 'mw:WikiLink'
						} } ]
					},
					ve.dm.example.italic
				]
			],
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'nested annotations are closed and reopened in the correct order': {
		'html': '<body><p><a rel="mw:WikiLink" href="Foo">F<b>o<i>o</i></b><i>b</i></a><i>a<b>r</b>b<u>a</u>z</i></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			[
				'F',
				[
					{
						'type': 'link/mwInternal',
						'attributes': {
							'hrefPrefix': '',
							'origTitle': 'Foo',
							'title': 'Foo'
						},
						'htmlAttributes': [ { 'values': {
							'href': 'Foo',
							'rel': 'mw:WikiLink'
						} } ]
					}
				]
			],
			[
				'o',
				[
					{
						'type': 'link/mwInternal',
						'attributes': {
							'hrefPrefix': '',
							'origTitle': 'Foo',
							'title': 'Foo'
						},
						'htmlAttributes': [ { 'values': {
							'href': 'Foo',
							'rel': 'mw:WikiLink'
						} } ]
					},
					ve.dm.example.bold
				]
			],
			[
				'o',
				[
					{
						'type': 'link/mwInternal',
						'attributes': {
							'hrefPrefix': '',
							'origTitle': 'Foo',
							'title': 'Foo'
						},
						'htmlAttributes': [ { 'values': {
							'href': 'Foo',
							'rel': 'mw:WikiLink'
						} } ]
					},
					ve.dm.example.bold,
					ve.dm.example.italic
				]
			],
			[
				'b',
				[
					{
						'type': 'link/mwInternal',
						'attributes': {
							'hrefPrefix': '',
							'origTitle': 'Foo',
							'title': 'Foo'

						},
						'htmlAttributes': [ { 'values': {
							'href': 'Foo',
							'rel': 'mw:WikiLink'
						} } ]
					},
					ve.dm.example.italic
				]
			],
			[
				'a',
				[
					ve.dm.example.italic
				]
			],
			[
				'r',
				[
					ve.dm.example.italic,
					ve.dm.example.bold
				]
			],
			[
				'b',
				[
					ve.dm.example.italic
				]
			],
			[
				'a',
				[
					ve.dm.example.italic,
					ve.dm.example.underline
				]
			],
			[
				'z',
				[
					ve.dm.example.italic
				]
			],
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'document with meta elements': {
		'html': '<body><!-- No content conversion --><meta property="mw:PageProp/nocc" /><p>Foo' +
			'<link rel="mw:WikiLink/Category" href="./Category:Bar" />Bar' +
			'<meta property="mw:foo" content="bar" />Ba<!-- inline -->z</p>' +
			'<meta property="mw:bar" content="baz" /><!--barbaz-->' +
			'<link rel="mw:WikiLink/Category" href="./Category:Foo_foo#Bar baz%23quux" />' +
			'<meta typeof="mw:Placeholder" data-parsoid="foobar" /></body>',
		'data': ve.dm.example.withMeta
	},
	'RDFa types spread across two attributes, about grouping is forced': {
		'html': '<body>' + ve.dm.example.MWTransclusion.mixed + '</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			ve.dm.example.MWTransclusion.mixedDataOpen,
			ve.dm.example.MWTransclusion.mixedDataClose,
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		],
		'storeItems': [
			ve.dm.example.MWTransclusion.mixedStoreItems
		]
	},
	'about grouping': {
		'html': '<body><div typeof="mw:Placeholder" about="#mwt1">Foo</div>' +
			'<figure typeof="mw:Placeholder" about="#mwt1">Bar</figure>' +
			'<figure typeof="mw:Placeholder" about="#mwt2">Baz</figure>' +
			'<span typeof="mw:Placeholder" about="#mwt2">Quux</span>' +
			'<p>Whee</p><span typeof="mw:Placeholder" about="#mwt2">Yay</span>' +
			'<div typeof="mw:Placeholder" about="#mwt2">Blah</div>' +
			'<span typeof="mw:Placeholder" about="#mwt3">Meh</span></body>',
		'data': [
			{
				'type': 'alienBlock',
				'attributes': {
					'domElements': $( '<div typeof="mw:Placeholder" about="#mwt1">Foo</div>' +
						'<figure typeof="mw:Placeholder" about="#mwt1">Bar</figure>' ).get()
				}
			},
			{ 'type': '/alienBlock' },
			{
				'type': 'alienBlock',
				'attributes': {
					'domElements': $( '<figure typeof="mw:Placeholder" about="#mwt2">Baz</figure>' +
						'<span typeof="mw:Placeholder" about="#mwt2">Quux</span>' ).get()
				}
			},
			{ 'type': '/alienBlock' },
			{ 'type': 'paragraph' },
			'W',
			'h',
			'e',
			'e',
			{ 'type': '/paragraph' },
			{
				'type': 'alienBlock',
				'attributes': {
					'domElements': $( '<span typeof="mw:Placeholder" about="#mwt2">Yay</span>' +
						'<div typeof="mw:Placeholder" about="#mwt2">Blah</div>' ).get()
				}
			},
			{ 'type': '/alienBlock' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			{
				'type': 'alienInline',
				'attributes': {
					'domElements': $( '<span typeof="mw:Placeholder" about="#mwt3">Meh</span>' ).get()
				}
			},
			{ 'type': '/alienInline' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation with an about group': {
		'html': '<body> <div typeof="mw:Placeholder" about="#mwt1">\tFoo\t\t</div>\t\t\t' +
			'<div typeof="mw:Placeholder" about="#mwt1">  Bar   </div>    </body>',
		'data': [
			{
				'type': 'alienBlock',
				'attributes': {
					'domElements': $( '<div typeof="mw:Placeholder" about="#mwt1">\tFoo\t\t</div>\t\t\t' +
						'<div typeof="mw:Placeholder" about="#mwt1">  Bar   </div>' ).get()
				},
				'internal': {
					'whitespace': [ ' ', undefined, undefined, '    ' ]
				}
			},
			{ 'type': '/alienBlock' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'mw:Entity': {
		'html': '<body><p>a<span typeof="mw:Entity">¢</span>b<span typeof="mw:Entity">¥</span><span typeof="mw:Entity">™</span></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			'a',
			{
				'type': 'mwEntity',
				'attributes': { 'character': '¢' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			'b',
			{
				'type': 'mwEntity',
				'attributes': { 'character': '¥' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			{
				'type': 'mwEntity',
				'attributes': { 'character': '™' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'wrapping with mw:Entity': {
		'html': '<body>a<span typeof="mw:Entity">¢</span>b<span typeof="mw:Entity">¥</span><span typeof="mw:Entity">™</span></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'a',
			{
				'type': 'mwEntity',
				'attributes': { 'character': '¢' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			'b',
			{
				'type': 'mwEntity',
				'attributes': { 'character': '¥' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			{
				'type': 'mwEntity',
				'attributes': { 'character': '™' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation with mw:Entity': {
		'html': '<body><p> a  <span typeof="mw:Entity"> </span>   b    <span typeof="mw:Entity">¥</span>\t<span typeof="mw:Entity">™</span></p></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ' ] } },
			'a',
			' ',
			' ',
			{
				'type': 'mwEntity',
				'attributes': { 'character': ' ' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			' ',
			' ',
			' ',
			'b',
			' ',
			' ',
			' ',
			' ',
			{
				'type': 'mwEntity',
				'attributes': { 'character': '¥' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			'\t',
			{
				'type': 'mwEntity',
				'attributes': { 'character': '™' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'block node inside annotation node is alienated': {
		'html': '<body><span>\n<p>Bar</p></span></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			[ '\n', [ ve.dm.example.span ] ],
			{
				'type': 'alienInline',
				'attributes': {
					'domElements': $( '<p>Bar</p>' ).get()
				},
				'annotations': [ ve.dm.example.span ]
			},
			{ 'type': '/alienInline' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'block node inside annotation node surrounded by tables': {
		'html': '<body><table></table><span>\n<p>Bar</p></span><table></table></body>',
		'data': [
			{ 'type': 'table' },
			{ 'type': '/table' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			[ '\n', [ ve.dm.example.span ] ],
			{
				'type': 'alienInline',
				'attributes': {
					'domElements': $( '<p>Bar</p>' ).get()
				},
				'annotations': [ ve.dm.example.span ]
			},
			{ 'type': '/alienInline' },
			{ 'type': '/paragraph' },
			{ 'type': 'table' },
			{ 'type': '/table' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'block node inside annotation node is alienated and continues wrapping': {
		'html': '<body>Foo<span>\n<p>Bar</p></span>Baz</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'F',
			'o',
			'o',
			[ '\n', [ ve.dm.example.span ] ],
			{
				'type': 'alienInline',
				'attributes': {
					'domElements': $( '<p>Bar</p>' ).get()
				},
				'annotations': [ ve.dm.example.span ]
			},
			{ 'type': '/alienInline' },
			'B',
			'a',
			'z',
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace before meta node in wrapping mode': {
		'html': '<body><table><tbody><tr><td>Foo\n<meta property="mw:foo" content="bar" /></td></tr></tbody></table></body>',
		'data': [
			{ 'type': 'table' },
			{ 'type': 'tableSection', 'attributes': { 'style': 'body' } },
			{ 'type': 'tableRow' },
			{
				'type': 'tableCell',
				'attributes': { 'style': 'data' },
				'internal': { 'whitespace': [ undefined, undefined, '\n' ] }
			},
			{
				'type': 'paragraph',
				'internal': {
					'generated': 'wrapper',
					'whitespace': [ undefined, undefined, undefined, '\n' ]
				}
			},
			'F',
			'o',
			'o',
			{ 'type': '/paragraph' },
			{
				'type': 'mwAlienMeta',
				'internal': { 'whitespace': [ '\n' ] },
				'attributes': {
					'domElements': $( '<meta property="mw:foo" content="bar" />' ).get()
				}
			},
			{ 'type': '/mwAlienMeta' },
			{ 'type': '/tableCell' },
			{ 'type': '/tableRow' },
			{ 'type': '/tableSection' },
			{ 'type': '/table' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'table with caption, head, foot and body': {
		'html': ve.dm.example.complexTableHtml,
		'data': ve.dm.example.complexTable
	},
	'category default sort key': {
		'html': '<body><meta property="mw:PageProp/categorydefaultsort" content="foo"></body>',
		'data': [
			{
				'type': 'mwDefaultSort',
				'attributes': {
					'content': 'foo'
				},
				'htmlAttributes': [ { 'values': {
					'content': 'foo',
					'property': 'mw:PageProp/categorydefaultsort'
				} } ]
			},
			{ 'type': '/mwDefaultSort' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'div set to RTL with paragraph inside': {
		'html': '<body><div style="direction: rtl;"><p>a<b>b</b>c<i>d</i>e</p></body>',
		'data': [
			{
				'type': 'div',
				'htmlAttributes': [ { 'values': { 'style': 'direction: rtl;' } } ]
			},
			{ 'type': 'paragraph' },
			'a',
			['b', [ ve.dm.example.bold ]],
			'c',
			['d', [ ve.dm.example.italic ]],
			'e',
			{ 'type': '/paragraph' },
			{ 'type': '/div' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'thumb image': {
		'html': '<body><figure typeof="mw:Image/Thumb"><a rel="mw:thumb" href="Foo"><img src="Bar" width="1" height="2" resource="FooBar"></a><figcaption class="mw-figcaption">abc</figcaption></figure></body>',
		'data': [
			{
				'type': 'mwBlockImage',
				'attributes': {
					'type': 'thumb',
					'align': 'default',
					'href': 'Foo',
					'src': 'Bar',
					'width': '1',
					'height': '2',
					'resource': 'FooBar'
				}
			},
			{ 'type': 'mwImageCaption' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'a', 'b', 'c',
			{ 'type': '/paragraph' },
			{ 'type': '/mwImageCaption' },
			{ 'type': '/mwBlockImage' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	}
};

ve.dm.example.isolationHtml =
	'<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>' +
	'Paragraph' +
	'<ul><li>Item 4</li><li>Item 5</li><li>Item 6</li></ul>' +
	'<table><tbody><tr><td>Cell 1</td><td>Cell 2</td><td>Cell 3</td></tr><tr><td>Cell 4</td></tr></tbody></table>' +
	'Not allowed by dm:' +
	'<ul><li><h1>Title in list</h1></li><li><pre>Preformatted in list</pre></li></ul>' +
	'<ul><li><ol><li>Nested 1</li><li>Nested 2</li><li>Nested 3</li></ol></li></ul>' +
	'<ul><li><p>P1</p><p>P2</p><p>P3</p></li></ul>';

ve.dm.example.isolationData = [
	// 0
	{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'I', 't', 'e', 'm', ' ', '1',
	{ 'type': '/paragraph' },
	// 10
	{ 'type': '/listItem' },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'I', 't', 'e', 'm', ' ', '2',
	{ 'type': '/paragraph' },
	// 20
	{ 'type': '/listItem' },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'I', 't', 'e', 'm', ' ', '3',
	{ 'type': '/paragraph' },
	// 30
	{ 'type': '/listItem' },
	{ 'type': '/list' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'P', 'a', 'r', 'a', 'g', 'r', 'a',
	// 40
	'p', 'h',
	{ 'type': '/paragraph' },
	{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'I', 't', 'e', 'm',
	// 50
	' ', '4',
	{ 'type': '/paragraph' },
	{ 'type': '/listItem' },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'I', 't', 'e', 'm',
	// 60
	' ', '5',
	{ 'type': '/paragraph' },
	{ 'type': '/listItem' },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'I', 't', 'e', 'm',
	// 70
	' ', '6',
	{ 'type': '/paragraph' },
	{ 'type': '/listItem' },
	{ 'type': '/list' },
	{ 'type': 'table' },
	{ 'type': 'tableSection', 'attributes': { 'style': 'body' } },
	{ 'type': 'tableRow' },
	{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	// 80
	'C', 'e', 'l', 'l', ' ', '1',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCell' },
	{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	// 90
	'C', 'e', 'l', 'l', ' ', '2',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCell' },
	{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	// 100
	'C', 'e', 'l', 'l', ' ', '3',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCell' },
	{ 'type': '/tableRow' },
	{ 'type': 'tableRow' },
	// 110
	{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'C', 'e', 'l', 'l', ' ', '4',
	{ 'type': '/paragraph' },
	{ 'type': '/tableCell' },
	// 120
	{ 'type': '/tableRow' },
	{ 'type': '/tableSection' },
	{ 'type': '/table' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'N', 'o', 't', ' ', 'a', 'l',
	// 130
	'l', 'o', 'w', 'e', 'd', ' ', 'b', 'y', ' ', 'd',
	// 140
	'm', ':',
	{ 'type': '/paragraph' },
	{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
	{ 'type': 'listItem' },
	{ 'type': 'heading', 'attributes': { 'level': 1 } },
	'T', 'i', 't', 'l',
	// 150
	'e', ' ', 'i', 'n', ' ', 'l', 'i', 's', 't',
	{ 'type': '/heading' },
	// 160
	{ 'type': '/listItem' },
	{ 'type': 'listItem' },
	{ 'type': 'preformatted' },
	'P', 'r', 'e', 'f', 'o', 'r', 'm',
	// 170
	'a', 't', 't', 'e', 'd', ' ', 'i', 'n', ' ', 'l',
	// 180
	'i', 's', 't',
	{ 'type': '/preformatted' },
	{ 'type': '/listItem' },
	{ 'type': '/list' },
	{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
	{ 'type': 'listItem' },
	{ 'type': 'list', 'attributes': { 'style': 'number' } },
	{ 'type': 'listItem' },
	// 190
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'N', 'e', 's', 't', 'e', 'd', ' ', '1',
	{ 'type': '/paragraph' },
	// 200
	{ 'type': '/listItem' },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'N', 'e', 's', 't', 'e', 'd', ' ',
	// 210
	'2',
	{ 'type': '/paragraph' },
	{ 'type': '/listItem' },
	{ 'type': 'listItem' },
	{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
	'N', 'e', 's', 't', 'e',
	// 220
	'd', ' ', '3',
	{ 'type': '/paragraph' },
	{ 'type': '/listItem' },
	{ 'type': '/list' },
	{ 'type': '/listItem' },
	{ 'type': '/list' },
	{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
	{ 'type': 'listItem' },
	// 230
	{ 'type': 'paragraph' },
	'P', '1',
	{ 'type': '/paragraph' },
	{ 'type': 'paragraph' },
	'P', '2',
	{ 'type': '/paragraph' },
	{ 'type': 'paragraph' },
	'P',
	// 240
	'3',
	{ 'type': '/paragraph' },
	{ 'type': '/listItem' },
	{ 'type': '/list' },
	{ 'type': 'internalList' },
	{ 'type': '/internalList' }
	// 246
];

ve.dm.example.references = [
	{ 'type': 'paragraph' },
	{
		'type': 'mwReference',
		 'attributes': {
			'about': '#mwt2',
			'contentsUsed': true,
			'listGroup': 'mwReference/',
			'listIndex': 0,
			'listKey': '"No name 1"',
			'mw': {
				'attrs': {},
				'body': { 'html': 'No name 1' },
				'name': 'ref'
			},
			'refGroup': ''
		},
		'htmlAttributes': [ { 'values': {
			'about': '#mwt2',
			'class': 'reference',
			'data-mw': '{"name":"ref","body":{"html":"No name 1"},"attrs":{}}',
			'data-parsoid': '{"src":"<ref>No name 1</ref>","dsr":[0,20,5,6]}',
			'id': 'cite_ref-1-0',
			'rel': 'dc:references',
			'typeof': 'mw:Extension/ref'
		} } ]
	},
	{ 'type': '/mwReference' },
	{ 'type': '/paragraph' },
	{ 'type': 'paragraph', 'htmlAttributes': [ { 'values': { 'data-parsoid': '{"dsr":[22,108,0,0]}' } } ] },
	'F', 'o', 'o',
	{
		'type': 'mwReference',
		 'attributes': {
			'about': '#mwt6',
			'contentsUsed': true,
			'listGroup': 'mwReference/',
			'listIndex': 1,
			'listKey': 'bar',
			'mw': {
				'attrs': { 'name': 'bar' },
				'body': { 'html': 'Bar' },
				'name': 'ref'
			},
			'refGroup': ''
		},
		'htmlAttributes': [ { 'values': {
			'about': '#mwt6',
			'class': 'reference',
			'data-mw': '{"name":"ref","body":{"html":"Bar"},"attrs":{"name":"bar"}}',
			'data-parsoid': '{"src":"<ref name=\\"bar\\">Bar</ref>","dsr":[25,50,16,6]}',
			'id': 'cite_ref-bar-2-0',
			'rel': 'dc:references',
			'typeof': 'mw:Extension/ref'
		} } ]
	},
	{ 'type': '/mwReference' },
	' ', 'B', 'a', 'z',
	{
		'type': 'mwReference',
		 'attributes': {
			'about': '#mwt7',
			'contentsUsed': true,
			'listGroup': 'mwReference/',
			'listIndex': 2,
			'listKey': 'quux',
			'mw': {
				'attrs': { 'name': 'quux' },
				'body': { 'html': 'Quux' },
				'name': 'ref'
			},
			'refGroup': ''
		},
		'htmlAttributes': [ { 'values': {
			'about': '#mwt7',
			'class': 'reference',
			'data-mw': '{"name":"ref","body":{"html":"Quux"},"attrs":{"name":"quux"}}',
			'data-parsoid': '{"src":"<ref name=\\"quux\\">Quux</ref>","dsr":[54,81,17,6]}',
			'id': 'cite_ref-quux-3-0',
			'rel': 'dc:references',
			'typeof': 'mw:Extension/ref'
		} } ]
	},
	{ 'type': '/mwReference' },
	' ', 'W', 'h', 'e', 'e',
	{
		'type': 'mwReference',
		'attributes': {
			'about': '#mwt8',
			'contentsUsed': false,
			'listGroup': 'mwReference/',
			'listIndex': 1,
			'listKey': 'bar',
			'mw': {
				'attrs': { 'name': 'bar' },
				'name': 'ref'
			},
			'refGroup': ''
		},
		'htmlAttributes': [ { 'values': {
			'about': '#mwt8',
			'class': 'reference',
			'data-mw': '{"name":"ref","attrs":{"name":"bar"}}',
			'data-parsoid': '{"src":"<ref name=\\"bar\\" />","dsr":[86,104,18,0]}',
			'id': 'cite_ref-bar-2-1',
			'rel': 'dc:references',
			'typeof': 'mw:Extension/ref'
		} } ]
	},
	{ 'type': '/mwReference' },
	' ', 'Y', 'a', 'y',
	{ 'type': '/paragraph' },
	{ 'type': 'paragraph' },
	{
		'type': 'mwReference',
		 'attributes': {
			'about': '#mwt11',
			'contentsUsed': true,
			'listGroup': 'mwReference/',
			'listIndex': 3,
			'listKey': '"No name 2"',
			'mw': {
				'attrs': {},
				'body': { 'html': 'No name 2' },
				'name': 'ref'
			},
			'refGroup': ''
			},
		'htmlAttributes': [ { 'values': {
			'about': '#mwt11',
			'class': 'reference',
			'data-mw': '{"name":"ref","body":{"html":"No name 2"},"attrs":{}}',
			'data-parsoid': '{"src":"<ref>No name 2</ref>","dsr":[110,130,5,6]}',
			'id': 'cite_ref-4-0',
			'rel': 'dc:references',
			'typeof': 'mw:Extension/ref'
		} } ]
	},
	{ 'type': '/mwReference' },
	{
		'type': 'mwReference',
		 'attributes': {
			'about': '#mwt12',
			'contentsUsed': true,
			'listGroup': 'mwReference/',
			'listIndex': 4,
			'listKey': '"No name 3"',
			'mw': {
				'attrs': {},
				'body': { 'html': 'No name 3' },
				'name': 'ref'
			},
			'refGroup': ''
		},
		'htmlAttributes': [ { 'values': {
			'about': '#mwt12',
			'class': 'reference',
			'data-mw': '{"name":"ref","body":{"html":"No name 3"},"attrs":{}}',
			'data-parsoid': '{"src":"<ref>No name 3</ref>"',
			'id': 'cite_ref-5-0',
			'rel': 'dc:references',
			'typeof': 'mw:Extension/ref'
		} } ]
	},
	{ 'type': '/mwReference' },
	{ 'type': '/paragraph' },
	{
		'type': 'mwReferenceList',
		'attributes': {
			//'domElements': HTML,
			'listGroup': 'mwReference/'
		}
	},
	{ 'type': '/mwReferenceList' },
	{ 'type': 'internalList' },
	{ 'type': 'internalItem' },
	{ 'type': 'paragraph' },
	'N', 'o', ' ', 'n', 'a', 'm', 'e', ' ', '1',
	{ 'type': '/paragraph' },
	{ 'type': '/internalItem' },
	{ 'type': 'internalItem' },
	{ 'type': 'paragraph' },
	'B', 'a', 'r',
	{ 'type': '/paragraph' },
	{ 'type': '/internalItem' },
	{ 'type': 'internalItem' },
	{ 'type' : 'paragraph' },
	'Q', 'u', 'u', 'x',
	{ 'type': '/paragraph' },
	{ 'type': '/internalItem' },
	{ 'type': 'internalItem' },
	{ 'type' : 'paragraph' },
	'N', 'o', ' ', 'n', 'a', 'm', 'e', ' ', '2',
	{ 'type': '/paragraph' },
	{ 'type': '/internalItem' },
	{ 'type': 'internalItem' },
	{ 'type' : 'paragraph' },
	'N', 'o', ' ', 'n', 'a', 'm', 'e', ' ', '3',
	{ 'type': '/paragraph' },
	{ 'type': '/internalItem' },
	{ 'type': '/internalList' }
];

ve.dm.example.selectNodesCases = [
	{
		'range': new ve.Range( 1 ),
		'mode': 'branches',
		'expected': [
			// heading
			{
				'node': [ 0 ],
				'range': new ve.Range( 1 ),
				'index': 0,
				'nodeRange': new ve.Range( 1, 4 ),
				'nodeOuterRange': new ve.Range( 0, 5 ),
				'parentOuterRange': new ve.Range( 0, 63 )
			}
		]
	},
	{
		'range': new ve.Range( 10 ),
		'mode': 'branches',
		'expected': [
			// table/tableSection/tableRow/tableCell/paragraph
			{
				'node': [ 1, 0, 0, 0, 0 ],
				'range': new ve.Range( 10 ),
				'index': 0,
				'nodeRange': new ve.Range( 10, 11 ),
				'nodeOuterRange': new ve.Range( 9, 12 ),
				'parentOuterRange': new ve.Range( 8, 34 )
			}
		]
	},
	{
		'range': new ve.Range( 20 ),
		'mode': 'branches',
		'expected': [
			// table/tableSection/tableRow/tableCell/list/listItem/list/listItem/paragraph
			{
				'node': [ 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
				'range': new ve.Range( 20 ),
				'index': 0,
				'nodeRange': new ve.Range( 20, 21 ),
				'nodeOuterRange': new ve.Range( 19, 22 ),
				'parentOuterRange': new ve.Range( 18, 23 )
			}
		]
	},
	{
		'range': new ve.Range( 1, 20 ),
		'mode': 'branches',
		'expected': [
			// heading
			{
				'node': [ 0 ],
				'range': new ve.Range( 1, 4 ),
				'index': 0,
				'nodeRange': new ve.Range( 1, 4 ),
				'nodeOuterRange': new ve.Range( 0, 5 ),
				'parentOuterRange': new ve.Range( 0, 63 )
			},

			// table/tableSection/tableRow/tableCell/paragraph
			{
				'node': [ 1, 0, 0, 0, 0 ],
				'index': 0,
				'nodeRange': new ve.Range( 10, 11 ),
				'nodeOuterRange': new ve.Range( 9, 12 ),
				'parentOuterRange': new ve.Range( 8, 34 )
			},

			// table/tableSection/tableRow/tableCell/list/listItem/paragraph
			{
				'node': [ 1, 0, 0, 0, 1, 0, 0 ],
				'index': 0,
				'nodeRange': new ve.Range( 15, 16 ),
				'nodeOuterRange': new ve.Range( 14, 17 ),
				'parentOuterRange': new ve.Range( 13, 25 )
			},

			// table/tableSection/tableRow/tableCell/list/listItem/list/listItem/paragraph
			{
				'node': [ 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
				'range': new ve.Range( 20 ),
				'index': 0,
				'nodeRange': new ve.Range( 20, 21 ),
				'nodeOuterRange': new ve.Range( 19, 22 ),
				'parentOuterRange': new ve.Range( 18, 23 )
			}
		]
	},
	{
		'range': new ve.Range( 1 ),
		'mode': 'branches',
		'expected': [
			// heading
			{
				'node': [ 0 ],
				'range': new ve.Range( 1 ),
				'index': 0,
				'nodeRange': new ve.Range( 1, 4 ),
				'nodeOuterRange': new ve.Range( 0, 5 ),
				'parentOuterRange': new ve.Range( 0, 63 )
			}
		]
	},
	{
		'range': new ve.Range( 0, 3 ),
		'mode': 'leaves',
		'expected': [
			// heading/text
			{
				'node': [ 0, 0 ],
				'range': new ve.Range( 1, 3 ),
				'index': 0,
				'nodeRange': new ve.Range( 1, 4 ),
				'nodeOuterRange': new ve.Range( 1, 4 ),
				'parentOuterRange': new ve.Range( 0, 5 )
			}
		],
		'msg': 'partial leaf results have ranges with global offsets'
	},
	{
		'range': new ve.Range( 0, 11 ),
		'mode': 'leaves',
		'expected': [
			// heading/text
			{
				'node': [ 0, 0 ],
				'index': 0,
				'nodeRange': new ve.Range( 1, 4 ),
				'nodeOuterRange': new ve.Range( 1, 4 ),
				'parentOuterRange': new ve.Range( 0, 5 )
			},
			// table/tableSection/tableRow/tableCell/paragraph/text
			{
				'node': [ 1, 0, 0, 0, 0, 0 ],
				'index': 0,
				'nodeRange': new ve.Range( 10, 11 ),
				'nodeOuterRange': new ve.Range( 10, 11 ),
				'parentOuterRange': new ve.Range( 9, 12 )
			}
		],
		'msg': 'leaf nodes do not have ranges, leaf nodes from different levels'
	},
	{
		'range': new ve.Range( 29, 43 ),
		'mode': 'leaves',
		'expected': [
			// table/tableSection/tableRow/tableCell/list/listItem/paragraph/text
			{
				'node': [ 1, 0, 0, 0, 2, 0, 0, 0 ],
				'index': 0,
				'nodeRange': new ve.Range( 29, 30 ),
				'nodeOuterRange': new ve.Range( 29, 30 ),
				'parentOuterRange': new ve.Range( 28, 31 )
			},
			// preformatted/text
			{
				'node': [ 2, 0 ],
				'index': 0,
				'nodeRange': new ve.Range( 38, 39 ),
				'nodeOuterRange': new ve.Range( 38, 39 ),
				'parentOuterRange': new ve.Range( 37, 43 )
			},
			// preformatted/image
			{
				'node': [ 2, 1 ],
				'index': 1,
				'nodeRange': new ve.Range( 40, 40 ),
				'nodeOuterRange': new ve.Range( 39, 41 ),
				'parentOuterRange': new ve.Range( 37, 43 )
			},
			// preformatted/text
			{
				'node': [ 2, 2 ],
				'index': 2,
				'nodeRange': new ve.Range( 41, 42 ),
				'nodeOuterRange': new ve.Range( 41, 42 ),
				'parentOuterRange': new ve.Range( 37, 43 )
			}
		],
		'msg': 'leaf nodes that are not text nodes'
	},
	{
		'range': new ve.Range( 2, 16 ),
		'mode': 'siblings',
		'expected': [
			// heading
			{
				'node': [ 0 ],
				'range': new ve.Range( 2, 4 ),
				'index': 0,
				'nodeRange': new ve.Range( 1, 4 ),
				'nodeOuterRange': new ve.Range( 0, 5 ),
				'parentOuterRange': new ve.Range( 0, 63 )
			},
			// table
			{
				'node': [ 1 ],
				'range': new ve.Range( 6, 16 ),
				'index': 1,
				'nodeRange': new ve.Range( 6, 36 ),
				'nodeOuterRange': new ve.Range( 5, 37 ),
				'parentOuterRange': new ve.Range( 0, 63 )
			}
		],
		'msg': 'siblings at the document level'
	},
	{
		'range': new ve.Range( 2, 51 ),
		'mode': 'siblings',
		'expected': [
			// heading
			{
				'node': [ 0 ],
				'range': new ve.Range( 2, 4 ),
				'index': 0,
				'nodeRange': new ve.Range( 1, 4 ),
				'nodeOuterRange': new ve.Range( 0, 5 ),
				'parentOuterRange': new ve.Range( 0, 63 )
			},
			// table
			{
				'node': [ 1 ],
				'index': 1,
				'nodeRange': new ve.Range( 6, 36 ),
				'nodeOuterRange': new ve.Range( 5, 37 ),
				'parentOuterRange': new ve.Range( 0, 63 )
			},
			// preformatted
			{
				'node': [ 2 ],
				'index': 2,
				'nodeRange': new ve.Range( 38, 42 ),
				'nodeOuterRange': new ve.Range( 37, 43 ),
				'parentOuterRange': new ve.Range( 0, 63 )
			},
			// definitionList
			{
				'node': [ 3 ],
				'range': new ve.Range( 44, 51 ),
				'index': 3,
				'nodeRange': new ve.Range( 44, 54 ),
				'nodeOuterRange': new ve.Range( 43, 55 ),
				'parentOuterRange': new ve.Range( 0, 63 )
			}
		],
		'msg': 'more than 2 siblings at the document level'
	},
	{
		'range': new ve.Range( 1, 1 ),
		'mode': 'leaves',
		'expected': [
			// heading/text
			{
				'node': [ 0, 0 ],
				'range': new ve.Range( 1, 1 ),
				'index': 0,
				'nodeRange': new ve.Range( 1, 4 ),
				'nodeOuterRange': new ve.Range( 1, 4 ),
				'parentOuterRange': new ve.Range( 0, 5 )
			}
		],
		'msg': 'zero-length range at the start of a text node returns text node rather than parent'
	},
	{
		'range': new ve.Range( 4, 4 ),
		'mode': 'leaves',
		'expected': [
			// heading/text
			{
				'node': [ 0, 0 ],
				'range': new ve.Range( 4, 4 ),
				'index': 0,
				'nodeRange': new ve.Range( 1, 4 ),
				'nodeOuterRange': new ve.Range( 1, 4 ),
				'parentOuterRange': new ve.Range( 0, 5 )
			}
		],
		'msg': 'zero-length range at the end of a text node returns text node rather than parent'
	},
	{
		'range': new ve.Range( 2, 3 ),
		'mode': 'leaves',
		'expected': [
			// heading/text
			{
				'node': [ 0, 0 ],
				'range': new ve.Range( 2, 3 ),
				'index': 0,
				'nodeRange': new ve.Range( 1, 4 ),
				'nodeOuterRange': new ve.Range( 1, 4 ),
				'parentOuterRange': new ve.Range( 0, 5 )
			}
		],
		'msg': 'range entirely within one leaf node'
	},
	{
		'range': new ve.Range( 5, 5 ),
		'mode': 'leaves',
		'expected': [
			// document
			{
				'node': [],
				'range': new ve.Range( 5, 5 ),
				// no 'index' because documentNode has no parent
				'indexInNode': 1,
				'nodeRange': new ve.Range( 0, 63 ),
				'nodeOuterRange': new ve.Range( 0, 63 )
			}
		],
		'msg': 'zero-length range between two children of the document'
	},
	{
		'range': new ve.Range( 0, 0 ),
		'mode': 'leaves',
		'expected': [
			// document
			{
				'node': [],
				'range': new ve.Range( 0, 0 ),
				// no 'index' because documentNode has no parent
				'indexInNode': 0,
				'nodeRange': new ve.Range( 0, 63 ),
				'nodeOuterRange': new ve.Range( 0, 63 )
			}
		],
		'msg': 'zero-length range at the start of the document'
	},
	{
		'range': new ve.Range( 32, 39 ),
		'mode': 'leaves',
		'expected': [
			// table/tableSection/tableRow/tableCell/list
			{
				'node': [ 1, 0, 0, 0, 2 ],
				'range': new ve.Range( 32, 32 ),
				'index': 2,
				'indexInNode': 1,
				'nodeRange': new ve.Range( 27, 32 ),
				'nodeOuterRange': new ve.Range( 26, 33 )
			},
			// preformatted/text
			{
				'node': [ 2, 0 ],
				// no 'range' because the text node is covered completely
				'index': 0,
				'nodeRange': new ve.Range( 38, 39 ),
				'nodeOuterRange': new ve.Range( 38, 39 ),
				'parentOuterRange': new ve.Range( 37, 43 )
			}
		],
		'msg': 'range with 5 closings and a text node'
	},
	{
		'range': new ve.Range( 2, 57 ),
		'mode': 'covered',
		'expected': [
			// heading/text
			{
				'node': [ 0, 0 ],
				'range': new ve.Range( 2, 4 ),
				'index': 0,
				'nodeRange': new ve.Range( 1, 4 ),
				'nodeOuterRange': new ve.Range( 1, 4 ),
				'parentOuterRange': new ve.Range( 0, 5 )
			},
			// table
			{
				'node': [ 1 ],
				// no 'range' because the table is covered completely
				'index': 1,
				'nodeRange': new ve.Range( 6, 36 ),
				'nodeOuterRange': new ve.Range( 5, 37 ),
				'parentOuterRange': new ve.Range( 0, 63 )
			},
			// preformatted
			{
				'node': [ 2 ],
				// no 'range' because the node is covered completely
				'index': 2,
				'nodeRange': new ve.Range( 38, 42 ),
				'nodeOuterRange': new ve.Range( 37, 43 ),
				'parentOuterRange': new ve.Range( 0, 63 )
			},
			// definitionList
			{
				'node': [ 3 ],
				// no 'range' because the node is covered completely
				'index': 3,
				'nodeRange': new ve.Range( 44, 54 ),
				'nodeOuterRange': new ve.Range( 43, 55 ),
				'parentOuterRange': new ve.Range( 0, 63 )
			},
			// paragraph/text
			{
				'node': [ 4, 0 ],
				// no 'range' because the text node is covered completely
				'index': 0,
				'nodeRange': new ve.Range( 56, 57 ),
				'nodeOuterRange': new ve.Range( 56, 57 ),
				'parentOuterRange': new ve.Range( 55, 58 )
			}
		],
		'msg': 'range from the first heading into the second-to-last paragraph, in covered mode'
	},
	{
		'range': new ve.Range( 14, 14 ),
		'mode': 'siblings',
		'expected': [
			// table/tableSection/tableRow/tableCell/list/listItem
			{
				'node': [ 1, 0, 0, 0, 1, 0 ],
				'range': new ve.Range( 14, 14 ),
				'index': 0,
				'indexInNode': 0,
				'nodeRange': new ve.Range( 14, 24 ),
				'nodeOuterRange': new ve.Range( 13, 25 )
			}
		],
		'msg': 'zero-length range at the beginning of a listItem, in siblings mode'
	},
	{
		'range': new ve.Range( 25, 27 ),
		'mode': 'covered',
		'expected': [
			// table/tableSection/tableRow/tableCell/list
			{
				'node': [ 1, 0, 0, 0, 1 ],
				'range': new ve.Range( 25, 25 ),
				'index': 1,
				'indexInNode': 1,
				'nodeRange': new ve.Range( 13, 25 ),
				'nodeOuterRange': new ve.Range( 12, 26 )
			},
			// table/tableSection/tableRow/tableCell/list
			{
				'node': [ 1, 0, 0, 0, 2 ],
				'range': new ve.Range( 27, 27 ),
				'index': 2,
				'indexInNode': 0,
				'nodeRange': new ve.Range( 27, 32 ),
				'nodeOuterRange': new ve.Range( 26, 33 )
			}
		],
		'msg': 'range covering a list closing and a list opening'
	},
	{
		'range': new ve.Range( 39, 39 ),
		'mode': 'leaves',
		'expected': [
			// preformatted/text
			{
				'node': [ 2, 0 ],
				'range': new ve.Range( 39, 39 ),
				'index': 0,
				'nodeRange': new ve.Range( 38, 39 ),
				'nodeOuterRange': new ve.Range( 38, 39 ),
				'parentOuterRange': new ve.Range( 37, 43 )
			}
		],
		'msg': 'zero-length range in text node before inline node'
	},
	{
		'range': new ve.Range( 41, 41 ),
		'mode': 'leaves',
		'expected': [
			// preformatted/text
			{
				'node': [ 2, 2 ],
				'range': new ve.Range( 41, 41 ),
				'index': 2,
				'nodeRange': new ve.Range( 41, 42 ),
				'nodeOuterRange': new ve.Range( 41, 42 ),
				'parentOuterRange': new ve.Range( 37, 43 )
			}
		],
		'msg': 'zero-length range in text node after inline node'
	},
	{
		'doc': 'emptyBranch',
		'range': new ve.Range( 1 ),
		'mode': 'leaves',
		'expected': [
			// table
			{
				'node': [ 0 ],
				'range': new ve.Range( 1, 1 ),
				'index': 0,
				'indexInNode': 0,
				'nodeRange': new ve.Range( 1, 1 ),
				'nodeOuterRange': new ve.Range( 0, 2 ),
				'parentOuterRange': new ve.Range( 0, 2 )
			}
		],
		'msg': 'Zero-length range in empty branch node'
	}
];
