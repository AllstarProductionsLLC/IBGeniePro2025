import { IbGenieLogo } from "./ib-genie-logo";

export function ThinkingIndicator() {
    return (
        <div className="flex items-center justify-center p-4">
            <div className="flex items-center gap-2">
                <IbGenieLogo className="h-8 w-8 animate-pulse-glow text-primary" />
                <span className="font-semibold text-muted-foreground animate-shimmer bg-clip-text text-transparent bg-[linear-gradient(110deg,theme(colors.muted.foreground),45%,theme(colors.foreground),55%,theme(colors.muted.foreground))] bg-[length:250%_100%]">
                    IBGenie is thinking...
                </span>
            </div>
        </div>
    );
}
