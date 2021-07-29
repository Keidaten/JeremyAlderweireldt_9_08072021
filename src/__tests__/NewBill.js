import { screen, fireEvent } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { ROUTES } from '../constants/routes.js';
import firebase from '../__mocks__/firebase';
import BillsUI from '../views/BillsUI.js';

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
			file.addEventListener('change', handleChangeFile);

			fireEvent.change(file, {
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

//// TEST D'INTEGRATION POST
describe('Given I am a user connected as Employee', () => {
	describe('When I create a new Bill', () => {
		test('send bill to mock API POST', async () => {
			const getSpy = jest.spyOn(firebase, 'post');
			const newBill = {
				id: '47qAXn6fIm2zOKkLzMrC',
				vat: '80',
				fileUrl: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.EaTqgOM7X5XM7wlTMEQe2AHaDj%26pid%3DApi&f=1',
				status: 'pending',
				type: 'Hôtel et logement',
				commentary: 'séminaire billed',
				name: 'encore',
				fileName: 'preview-facture-free-201801-pdf-1.jpg',
				date: '2010-04-04',
				amount: 4000,
				commentAdmin: 'à valider',
				email: 'a@a',
				pct: 20,
			};
			const bills = await firebase.post(newBill);
			// getSpy doit avoir été appelé une fois
			expect(getSpy).toHaveBeenCalledTimes(1);
			// le nombre de bills doit être de 4 + 1
			expect(bills.data.length).toBe(5);
		});
		test('send bill to API and fails with 404 message error', async () => {
			firebase.post.mockImplementationOnce(() => Promise.reject(new Error('Erreur 404')));
			const html = BillsUI({ error: 'Erreur 404' });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 404/);
			expect(message).toBeTruthy();
		});
		test('send bill to API and fails with 500 message error', async () => {
			firebase.post.mockImplementationOnce(() => Promise.reject(new Error('Erreur 500')));
			const html = BillsUI({ error: 'Erreur 500' });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 500/);
			expect(message).toBeTruthy();
		});
	});
});
