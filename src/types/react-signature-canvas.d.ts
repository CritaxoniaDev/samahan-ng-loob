declare module 'react-signature-canvas' {
    import * as React from 'react';
    
    export interface SignatureCanvasProps {
        canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
        clearOnResize?: boolean;
        onBegin?: () => void;
        onEnd?: () => void;
        backgroundColor?: string;
        penColor?: string;
        velocityFilterWeight?: number;
        minWidth?: number;
        maxWidth?: number;
        dotSize?: number;
        minDistance?: number;
    }
    
    export default class SignatureCanvas extends React.Component<SignatureCanvasProps> {
        clear: () => void;
        trim: () => void;
        fromDataURL: (dataURL: string) => void;
        toDataURL: (type?: string, encoderOptions?: number) => string;
        isEmpty: () => boolean;
        getCanvas: () => HTMLCanvasElement;
        getTrimmedCanvas: () => HTMLCanvasElement;
    }
}
