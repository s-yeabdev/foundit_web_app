const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  
  
  if (!username || username.length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Username must be at least 3 characters long.'
    });
  }
  
  if (username.length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Username must be less than 50 characters.'
    });
  }

  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  
  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.'
    });
  }

  next();
};

const validateItem = (req, res, next) => {
  const { title, description, category, location, date, type } = req.body;
  
  
  if (!title || title.length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Title must be at least 3 characters long.'
    });
  }

  
  if (!description || description.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Description must be at least 10 characters long.'
    });
  }

  
  if (!category || category.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Category is required.'
    });
  }

  
  if (!location || location.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Location is required.'
    });
  }

  
  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Date is required.'
    });
  }

  
  if (!type || !['Lost', 'Found'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Type must be either "Lost" or "Found".'
    });
  }

  next();
};

module.exports = { validateRegistration, validateItem };