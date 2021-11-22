import { FormControl, ValidationErrors } from "@angular/forms";

export class ShopValidator {

    static notOnlyWhiteSpace (controls: FormControl): ValidationErrors {
        if((controls.value != null) && (controls.value.trim().length === 0))
            return {'notOnlyWhiteSpace': true};

        else
        return null;
    }
}
