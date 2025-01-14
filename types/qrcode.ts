export interface QRCodeOptions {
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    type: string;
    quality: number;
    margin: number;
    color: {
      dark: string;
      light: string;
    };
    version: number;
  }
  
  