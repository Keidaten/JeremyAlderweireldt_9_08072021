import { screen, fireEvent } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { ROUTES } from '../constants/routes.js';

describe('Given I am connected as an employee', () => {
	describe("When I am on NewBill Page and I'm adding a valid file", () => {
		test('Then this file should be added to the input', () => {
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
	describe('When I am on NewBill Page and I submit the form with an invalid file extension', () => {
		test('Then we should stay on the same page', () => {
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
			const handleSubmit = jest.fn(() => newNewBill.handleSubmit);

			newNewBill.fileName = 'Invalid format';

			const form = screen.getByTestId('form-new-bill');
			form.addEventListener('submit', handleSubmit);
			fireEvent.submit(form);

			expect(newNewBill.fileName).toBe('Invalid format');
			expect(screen.getByText('Envoyer une note de frais')).toBeTruthy;
			expect(handleSubmit).toHaveBeenCalled();
		});
	});
	describe('When I am on NewBill Page and I submit the form with a valid file extension', () => {
		test('Then page should change and bring us back to dashboard', () => {
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
			const handleSubmit = jest.fn(() => newNewBill.handleSubmit);

			const form = screen.getByTestId('form-new-bill');
			form.addEventListener('submit', handleSubmit);
			fireEvent.submit(form);

			expect(screen.getByText('Mes notes de frais')).toBeTruthy;
			expect(handleSubmit).toHaveBeenCalled();
		});
	});
});
