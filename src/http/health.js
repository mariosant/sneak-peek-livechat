const handler = async (ctx) => {
	await ctx.collections.accounts.count()
	await ctx.queue.count()

	ctx.body = 'ok'
}

module.exports = handler