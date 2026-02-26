const router=require('express').Router();
const lobbyController=require('../controllers/lobbyController');
const auth=require('../middleware/auth');
router.post('/',lobbyController.joinMeeting);
router.post('/create-meeting',lobbyController.createMeeting);
router.post('/creating-meeting-later',lobbyController.createMeetingLater);
module.exports= router;
