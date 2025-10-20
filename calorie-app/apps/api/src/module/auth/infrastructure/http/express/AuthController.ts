export class AuthController {
  login = async (req: any, res: any) => {
    const { email } = req.body ?? {};
    return res.json({
      token: 'devtoken',
      user: { id: 'u1', email: email ?? 'dev@local' },
    });
  };

  register = async (req: any, res: any) => {
    const { email } = req.body ?? {};
    return res.status(201).json({
      id: 'u1',
      email: email ?? 'dev@local',
    });
  };
}
