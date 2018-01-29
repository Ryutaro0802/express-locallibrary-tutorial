const async = require('async')

const Genre = require('../models/genre')
const Book = require('../models/book')

const { body, validationResult } = require('express-validator/check')
const { sanitizeBody } = require('express-validator/filter')

// Display list of all Genre

exports.genre_list = (req, res, next) => {
	Genre.find()
		.sort([['name', 'ascending']])
		.exec((err, list_genres) => {
			if (err) { return next(err) }

			res.render('genre_list', { title: 'Genre List', genre_list: list_genres })
		})
}

// Display detail page for a specific Genre

exports.genre_detail = (req, res, next) => {
	async.parallel({
		genre: (callback) => {
			Genre.findById(req.params.id)
				.exec(callback)
		},

		genre_books: (callback) => {
			Book.find({ 'genre': req.params.id })
				.exec(callback)
		},

	}, (err, results) => {
		if (err) { return next(err) }

		if (results.genre == null) { // No results.
			const err = new Error('Genre not found')

			err.status = 404

			return next(err)
		}

		// Successful, so render
		res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books })
	})
}

// Display Genre create form on GET

exports.genre_create_get = (req, res, next) => {
	res.render('genre_form', { title: 'Create Genre' })
}

// Handle Genre create on POST

exports.genre_create_post = [
	// nameが空じゃない
	body('name', 'Genre name required').isLength({ min: 1 }).trim(),

	// サニタイズ
	sanitizeBody('name').trim().escape(),
	
	(req, res, next) => {
		const errors = validationResult(req)
		const genre = new Genre({ name: req.body.name })

		if (!errors.isEmpty()) {
			// エラーあり
			res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() })
			return
		} else {
			// エラーなし
			Genre.findOne({ 'name': req.body.name })
				.exec((err, found_genre) => {
					if (err) { return next(err) }

					if (found_genre) {	// 登録するジャンルがすでにあったらリダイレクト
						res.redirect(found_genre.url)
					} else {	// なかったら登録
						genre.save((err) => {
							if (err) { return next(err) }
							res.redirect(genre.url);
						})
					}
				})
		}
	}
]

// Display Genre delete form on GET

exports.genre_delete_get = (req, res) => {
	res.send('NOT IMPLEMENTED: Genre delete GET')
}

// Handle Genre delete on POST

exports.genre_delete_post = (req, res) => {
	res.send('NOT IMPLEMENTED: Genre delete POST')
}

// Display Genre update form on GET

exports.genre_update_get = (req, res) => {
	res.send('NOT IMPLEMENTED: Genre update GET')
}

// Handle Genre update on POST

exports.genre_update_post = (req, res) => {
	res.send('NOT IMPLEMENTED: Genre update POST')
}