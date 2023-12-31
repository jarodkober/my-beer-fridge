import { useEffect } from 'react';
import styles from './CellarForm.module.scss';
import { useAddCellarMutation } from '../../store';
import { PropTypes } from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import classNames from 'classnames';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

function CellarForm({ onHide, toast, user }) {
	CellarForm.propTypes = {
		onHide: PropTypes.func,
		toast: PropTypes.object,
		user: PropTypes.object
	};

	const defaultValues = {
		cellar_description: '',
		cellar_name: ''
	};

	const {
		control,
		formState: { errors },
		handleSubmit,
		reset
	} = useForm({ defaultValues });

	const [addCellar, results] = useAddCellarMutation();

	const onSubmit = (data) => {
		data = {
			...data,
			user_auth: user.signInUserSession.idToken.jwtToken,
			user_id: user.username
		};

		addCellar(data);

		reset();
	};

	const getFormErrorMessage = (name) => {
		return (
			errors[name] && (
				<small className="p-error">{errors[name].message}</small>
			)
		);
	};

	useEffect(() => {
		if (results.isSuccess) {
			onHide();
		}
	}, [onHide, results.isSuccess]);

	useEffect(() => {
		results.error &&
			toast.current.show({
				detail: 'An error occurred while creating your cellar. This is most likely due to a cost-saving measure that pauses the database during periods of inactivity. Please try again in 30 seconds.',
				severity: 'error',
				sticky: true,
				summary: 'Error'
			});
	}, [results.error, toast]);

	return (
		<form
			className={styles.form}
			onSubmit={handleSubmit(onSubmit)}
		>
			<div className="field">
				<span className="p-float-label">
					<Controller
						control={control}
						name="cellar_name"
						rules={{
							required: 'A cellar name is required.'
						}}
						render={({ field, fieldState }) => (
							<InputText
								autoComplete="off"
								autoFocus
								className={classNames({
									'p-invalid': fieldState.invalid
								})}
								id={field.name}
								{...field}
							/>
						)}
					/>
					<label
						className={classNames({ 'p-error': errors.name })}
						htmlFor="cellar_name"
					>
						Name
					</label>
				</span>

				{getFormErrorMessage('name')}
			</div>

			<div className="field">
				<span className="p-float-label">
					<Controller
						control={control}
						name="cellar_description"
						render={({ field, fieldState }) => (
							<InputTextarea
								className={classNames({
									'p-invalid': fieldState.invalid
								})}
								id={field.name}
								{...field}
							/>
						)}
					/>
					<label
						className={classNames({ 'p-error': errors.name })}
						htmlFor="cellar_description"
					>
						Description
					</label>
				</span>

				{getFormErrorMessage('name')}
			</div>

			<Button
				disabled={results.isLoading}
				icon="pi pi-plus"
				label="Create Cellar"
			/>
		</form>
	);
}

export default CellarForm;
