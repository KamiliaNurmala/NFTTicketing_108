const Event = require('../models/Event');

class EventController {
  async getAll(req, res) {
    try {
      const events = await Event.findAll({
        where: {
          date: {
            [require('sequelize').Op.gte]: new Date()
          }
        },
        order: [['date', 'ASC']]
      });

      res.json({ success: true, events });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const event = await Event.findByPk(id);

      if (!event) {
        return res.status(404).json({ 
          success: false, 
          message: 'Event not found' 
        });
      }

      res.json({ success: true, event });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new EventController();