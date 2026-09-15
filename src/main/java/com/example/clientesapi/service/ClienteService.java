package com.example.clientesapi.service;

import com.example.clientesapi.dto.ClienteRequest;
import com.example.clientesapi.exception.RecursoNoEncontradoException;
import com.example.clientesapi.model.Cliente;
import com.example.clientesapi.repository.ClienteRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Transactional(readOnly = true)
    public List<Cliente> listar() {
        return clienteRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Cliente buscarPorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado con id " + id));
    }

    @Transactional
    public Cliente crear(ClienteRequest request) {
        String email = normalizarEmail(request.getEmail());

        if (clienteRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Ya existe un cliente con el email " + email);
        }

        Cliente cliente = new Cliente();
        copiarDatos(request, cliente, email);
        return clienteRepository.save(cliente);
    }

    @Transactional
    public Cliente actualizar(Long id, ClienteRequest request) {
        Cliente cliente = buscarPorId(id);
        String email = normalizarEmail(request.getEmail());

        if (clienteRepository.existsByEmailAndIdNot(email, id)) {
            throw new IllegalArgumentException("Ya existe un cliente con el email " + email);
        }

        copiarDatos(request, cliente, email);
        return clienteRepository.save(cliente);
    }

    @Transactional
    public void eliminar(Long id) {
        Cliente cliente = buscarPorId(id);
        clienteRepository.delete(cliente);
    }

    private void copiarDatos(ClienteRequest request, Cliente cliente, String email) {
        cliente.setNombre(request.getNombre().trim());
        cliente.setEmail(email);
        cliente.setTelefono(request.getTelefono());
        cliente.setDireccion(request.getDireccion());
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase();
    }
}
