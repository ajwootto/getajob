
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Adam Wootton'});
};
exports.nav = function(req, res){
	res.render(req.body.link)
}
exports.info = function(req, res) {
	res.render('zoom/' + req.body.name)
}