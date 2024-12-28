navigation.navigate('BookingConfirmation', {
  professionalId: professional.id,
  serviceName: selectedService.name,
  servicePrice: selectedService.price,
  serviceDuration: selectedService.duration,
  serviceId: selectedService.id,
  professionalName: professional.business_name || professional.name,
  date: selectedDate,
  time: selectedTime
}); 