export const validate = (schema, source = 'body') => (req, res, next) => {
	const result = schema.safeParse(req[source]);

	if (!result.success) {
		return res.status(422).json({
			error: {
				code: 'VALIDATION_ERROR',
				message: 'Request validation failed',
				details: result.error.issues.map((issue) => ({
					field: issue.path.join('.'),
					issue: issue.message,
				})),
			},
		});
	}

	req.validated ??= {};
	req.validated[source] = result.data;
	return next();
};
