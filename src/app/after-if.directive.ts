import { Directive, AfterContentInit, EventEmitter, Output } from '@angular/core';

@Directive({
  selector: '[appAfterIf]'
})
export class AfterIfDirective implements AfterContentInit {
    @Output('appAfterIf')
    public after: EventEmitter<AfterIfDirective> = new EventEmitter();

    constructor() { }

    public ngAfterContentInit(): void {
        setTimeout(()=>{
           // timeout helps prevent unexpected change errors
           this.after.next(this);
        });
    }
}
