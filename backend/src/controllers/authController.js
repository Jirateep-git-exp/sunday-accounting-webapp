const authService = require('../services/authService');

class AuthController {
  async register(req, res) {
    try {
      const { user, token } = await authService.register(req.body);
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email
          },
          token
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);
      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email
          },
          token
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
