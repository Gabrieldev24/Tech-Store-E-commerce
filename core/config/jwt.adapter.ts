import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_for_upn_project';

export class JwtAdapter {

  // 1. Cambiamos el tipo de duration a 'any' o usamos una firma compatible con SignOptions
  static async generateToken(payload: any, duration: any = '2h'): Promise<string | null> {
    return new Promise((resolve) => {
      
      const options: SignOptions = {
        expiresIn: duration
      };

      // Forzamos a que reconozca JWT_SECRET como un string puro
      jwt.sign(payload, JWT_SECRET as string, options, (err, token) => {
        if (err) return resolve(null);
        resolve(token!);
      });
    });
  }

  static verifyToken(token: string): any | null {
    try {
      return jwt.verify(token, JWT_SECRET as string);
    } catch {
      return null;
    }
  }
}