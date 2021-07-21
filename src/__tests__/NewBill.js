import { screen, fireEvent } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { ROUTES } from '../constants/routes.js';

describe('Given I am connected as an employee', () => {
	describe('When I am on NewBill Page and I adding a file', () => {
		test('Then a file should be added to the input', () => {
			//Defini le localStorage
			Object.defineProperty(window, 'localStorage', { value: localStorageMock });
			window.localStorage.setItem(
				'user',
				JSON.stringify({
					type: 'Employee',
				})
			);
			//Template html
			const html = NewBillUI();
			document.body.innerHTML = html;

			// Navigation
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};

			//Firestore = null
			const firestore = null;

			//Bill initialisation
			const newNewBill = new NewBill({
				document,
				onNavigate,
				firestore,
				localStorage: window.localStorage,
			});

			//Tests
			const handleChangeFile = jest.fn(() => newNewBill.handleChangeFile);
			const file = screen.getByTestId('file');
			file.addEventListener('input', handleChangeFile);

			fireEvent.input(file, {
				target: {
					files: [new File(['file.png'], 'file.png', { type: 'image/png' })],
				},
			});

			expect(file.files[0].name).toBe('file.png');
			expect(handleChangeFile).toHaveBeenCalled();
		});
	});
});
