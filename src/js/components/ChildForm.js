/**
 * Component for child profile form
 */
export class ChildForm {
    /**
     * @param {Function} fnOnSubmit - Submit handler
     * @param {User} [obUser] - Existing user for editing
     */
    constructor(fnOnSubmit, obUser = null) {
        this.fnOnSubmit = fnOnSubmit;
        this.obUser = obUser;
        this.element = this.createForm();
    }

    /**
     * Create form element
     * @private
     * @returns {HTMLElement}
     */
    createForm() {
        const elForm = document.createElement('form');
        elForm.className = 'bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto';

        const elTitle = document.createElement('h2');
        elTitle.className = 'text-2xl font-bold mb-6 text-center';
        elTitle.textContent = this.obUser ? 'Edit Profile' : 'New Time Wallet';
        elForm.appendChild(elTitle);

        // Name input
        const elNameGroup = this.createFormGroup(
            'name',
            'Full Name',
            'text',
            this.obUser?.sName || '',
            'Enter full name'
        );
        elForm.appendChild(elNameGroup);

        // Nickname input
        const elNicknameGroup = this.createFormGroup(
            'nickname',
            'Nickname',
            'text',
            this.obUser?.sNickname || '',
            'Enter nickname'
        );
        elForm.appendChild(elNicknameGroup);

        // Schedule section
        const elScheduleTitle = document.createElement('h3');
        elScheduleTitle.className = 'text-xl font-semibold mt-6 mb-4';
        elScheduleTitle.textContent = 'Time Usage Schedule';
        elForm.appendChild(elScheduleTitle);

        // Days of week
        const arDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        arDays.forEach(sDay => {
            const elDaySchedule = this.createDaySchedule(sDay, this.obUser?.arSchedule);
            elForm.appendChild(elDaySchedule);
        });

        // Submit button
        const elSubmitButton = document.createElement('button');
        elSubmitButton.type = 'submit';
        elSubmitButton.className = `
            w-full py-3 px-4 
            bg-purple-500 hover:bg-purple-600 
            text-white font-bold 
            rounded-lg 
            transition-colors
            mt-6
        `;
        elSubmitButton.textContent = this.obUser ? 'Save Changes' : 'Create Time Wallet';
        elForm.appendChild(elSubmitButton);

        // Event handlers
        elForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(elForm);
            
            const obSchedule = arDays.map(sDay => ({
                sDay,
                sStartTime: formData.get(`${sDay.toLowerCase()}-start`),
                sEndTime: formData.get(`${sDay.toLowerCase()}-end`),
                bEnabled: formData.get(`${sDay.toLowerCase()}-enabled`) === 'true'
            }));

            this.fnOnSubmit({
                sName: formData.get('name'),
                sNickname: formData.get('nickname'),
                arSchedule: obSchedule,
                sId: this.obUser?.sId
            });
        });

        return elForm;
    }

    /**
     * Create form input group
     * @private
     * @param {string} sName - Input name
     * @param {string} sLabel - Input label
     * @param {string} sType - Input type
     * @param {string} sValue - Input value
     * @param {string} sPlaceholder - Input placeholder
     * @returns {HTMLElement}
     */
    createFormGroup(sName, sLabel, sType, sValue, sPlaceholder) {
        const elDiv = document.createElement('div');
        elDiv.className = 'mb-4';

        const elLabel = document.createElement('label');
        elLabel.className = 'block text-sm font-medium mb-2';
        elLabel.textContent = sLabel;

        const elInput = document.createElement('input');
        elInput.type = sType;
        elInput.name = sName;
        elInput.value = sValue;
        elInput.placeholder = sPlaceholder;
        elInput.required = true;
        elInput.className = `
            w-full px-3 py-2 
            border rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-purple-500
        `;

        elDiv.appendChild(elLabel);
        elDiv.appendChild(elInput);
        return elDiv;
    }

    /**
     * Create schedule inputs for a day
     * @private
     * @param {string} sDay - Day of week
     * @param {Schedule[]} arSchedule - Existing schedule
     * @returns {HTMLElement}
     */
    createDaySchedule(sDay, arSchedule) {
        const obDaySchedule = arSchedule?.find(s => s.sDay === sDay) || { 
            sStartTime: '15:00', 
            sEndTime: '20:00', 
            bEnabled: true 
        };

        const elDiv = document.createElement('div');
        elDiv.className = 'mb-4 p-4 border rounded-lg';

        const elDayHeader = document.createElement('div');
        elDayHeader.className = 'flex items-center justify-between mb-3';

        // Day toggle
        const elToggle = document.createElement('label');
        elToggle.className = 'flex items-center cursor-pointer';
        elToggle.innerHTML = `
            <input type="checkbox" 
                   name="${sDay.toLowerCase()}-enabled" 
                   value="true"
                   ${obDaySchedule.bEnabled ? 'checked' : ''}
                   class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                        peer-focus:ring-purple-300 rounded-full peer 
                        peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                        after:bg-white after:border-gray-300 after:border after:rounded-full 
                        after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            <span class="ml-3 font-medium">${sDay}</span>
        `;

        elDayHeader.appendChild(elToggle);

        // Time inputs container
        const elTimeInputs = document.createElement('div');
        elTimeInputs.className = 'flex gap-4';

        // Start time
        const elStartTime = document.createElement('div');
        elStartTime.className = 'flex-1';
        const elStartLabel = document.createElement('label');
        elStartLabel.className = 'block text-sm font-medium mb-1';
        elStartLabel.textContent = 'From';
        const elStartInput = document.createElement('input');
        elStartInput.type = 'time';
        elStartInput.name = `${sDay.toLowerCase()}-start`;
        elStartInput.value = obDaySchedule.sStartTime;
        elStartInput.className = 'w-full px-2 py-1 border rounded';
        elStartTime.appendChild(elStartLabel);
        elStartTime.appendChild(elStartInput);

        // End time
        const elEndTime = document.createElement('div');
        elEndTime.className = 'flex-1';
        const elEndLabel = document.createElement('label');
        elEndLabel.className = 'block text-sm font-medium mb-1';
        elEndLabel.textContent = 'To';
        const elEndInput = document.createElement('input');
        elEndInput.type = 'time';
        elEndInput.name = `${sDay.toLowerCase()}-end`;
        elEndInput.value = obDaySchedule.sEndTime;
        elEndInput.className = 'w-full px-2 py-1 border rounded';
        elEndTime.appendChild(elEndLabel);
        elEndTime.appendChild(elEndInput);

        elTimeInputs.appendChild(elStartTime);
        elTimeInputs.appendChild(elEndTime);
        elDiv.appendChild(elDayHeader);
        elDiv.appendChild(elTimeInputs);

        return elDiv;
    }
}